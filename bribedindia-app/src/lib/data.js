import { supabase, isSupabaseConfigured } from './supabase.js'
import { getReports, submitDemoReport, markClusterVerifiedDemo } from './demoStore.js'

export const DEMO_MODE = !isSupabaseConfigured

const ADMIN_EMAIL = 'admin@bribedindia.demo'
const ADMIN_PASSWORD = 'Demo@1234'

export async function getAllReports() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('reports').select('*')
    if (error) throw error
    return data || []
  }
  return getReports()
}

export async function submitReport(payload) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.rpc('submit_report', {
      p_report_type: payload.report_type,
      p_department_code: payload.department_code,
      p_department_other: payload.department_other || null,
      p_state: payload.state,
      p_district: payload.district || null,
      p_service: payload.service || null,
      p_approx_month: payload.approx_month,
      p_approx_year: payload.approx_year,
      p_bribe_amount: payload.bribe_amount ?? null,
      p_description: payload.description || null,
      p_client_session_id: payload.client_session_id,
    })
    if (error) {
      if (error.message && error.message.includes('rate_limited')) {
        return { error: 'rate_limited' }
      }
      return { error: 'submit_failed' }
    }
    return { report: data, error: null }
  }
  return submitDemoReport(payload)
}

export async function markClusterVerified(departmentCode, state, service) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.rpc('mark_cluster_verified', {
      p_department_code: departmentCode,
      p_state: state,
      p_service: service,
    })
    if (error) throw error
    return
  }
  markClusterVerifiedDemo(departmentCode, state, service)
}

export async function loginAdmin(email, password) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: 'invalid_credentials' }
    return { error: null }
  }
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem('bribedindia_admin_session', 'demo-authed')
    return { error: null }
  }
  return { error: 'invalid_credentials' }
}

export async function getAdminSession() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession()
    return data.session ? data.session : null
  }
  return localStorage.getItem('bribedindia_admin_session') ? { demo: true } : null
}

export async function signOutAdmin() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut()
    return
  }
  localStorage.removeItem('bribedindia_admin_session')
}

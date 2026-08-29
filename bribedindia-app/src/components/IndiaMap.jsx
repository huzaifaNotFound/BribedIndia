import { useEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import * as am5map from '@amcharts/amcharts5/map'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import am5geodata_indiaHigh from '@amcharts/amcharts5-geodata/indiaHigh.js'

const STATE_TO_IDS = {
  'Andaman and Nicobar Islands': ['IN-AN'],
  'Andhra Pradesh': ['IN-AP'],
  'Arunachal Pradesh': ['IN-AR'],
  Assam: ['IN-AS'],
  Bihar: ['IN-BR'],
  Chandigarh: ['IN-CH'],
  Chhattisgarh: ['IN-CT'],
  Goa: ['IN-GA'],
  Gujarat: ['IN-GJ'],
  Haryana: ['IN-HR'],
  'Himachal Pradesh': ['IN-HP'],
  Jharkhand: ['IN-JH'],
  Karnataka: ['IN-KA'],
  Kerala: ['IN-KL'],
  'Madhya Pradesh': ['IN-MP'],
  Maharashtra: ['IN-MH'],
  Manipur: ['IN-MN'],
  Meghalaya: ['IN-ML'],
  Mizoram: ['IN-MZ'],
  Nagaland: ['IN-NL'],
  Odisha: ['IN-OR'],
  Punjab: ['IN-PB'],
  Rajasthan: ['IN-RJ'],
  Sikkim: ['IN-SK'],
  'Tamil Nadu': ['IN-TN'],
  Telangana: ['IN-TG'],
  Tripura: ['IN-TR'],
  'Uttar Pradesh': ['IN-UP'],
  Uttarakhand: ['IN-UT'],
  'West Bengal': ['IN-WB'],
  Delhi: ['IN-DL'],
  'Jammu and Kashmir': ['IN-JK'],
  Lakshadweep: ['IN-LD'],
  Puducherry: ['IN-PY'],
  'Dadra and Nagar Haveli and Daman and Diu': ['IN-DN', 'IN-DD'],
}

const ID_TO_STATE = {}
for (const [state, ids] of Object.entries(STATE_TO_IDS)) {
  for (const id of ids) ID_TO_STATE[id] = state
}

const COLOR_MIN = [235, 233, 227]
const COLOR_MAX = [26, 26, 26]

function lerpColor(t) {
  const clamped = Math.max(0, Math.min(1, t))
  const r = Math.round(COLOR_MIN[0] + (COLOR_MAX[0] - COLOR_MIN[0]) * clamped)
  const g = Math.round(COLOR_MIN[1] + (COLOR_MAX[1] - COLOR_MIN[1]) * clamped)
  const b = Math.round(COLOR_MIN[2] + (COLOR_MAX[2] - COLOR_MIN[2]) * clamped)
  return am5.color(`rgb(${r},${g},${b})`)
}

export default function IndiaMap({ stateData, selectedState, onSelectState }) {
  const divRef = useRef(null)
  const applySelectionRef = useRef(null)

  useEffect(() => {
    const root = am5.Root.new(divRef.current)
    root.setThemes([am5themes_Animated.new(root)])

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: 'none',
        panY: 'none',
        wheelY: 'none',
        projection: am5map.geoMercator(),
      })
    )

    const maxCount = Math.max(0, ...stateData.map((s) => s.total))
    const countById = new Map()
    for (const s of stateData) {
      const ids = STATE_TO_IDS[s.state]
      if (!ids) continue
      for (const id of ids) countById.set(id, s.total)
    }

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        valueField: 'value',
        tooltip: am5.Tooltip.new(root, {}),
      })
    )

    polygonSeries.data.setAll(
      am5geodata_indiaHigh.features.map((f) => ({
        id: f.id,
        value: countById.get(f.id) || 0,
      }))
    )

    polygonSeries.set('geoJSON', am5geodata_indiaHigh)

    const nameById = new Map(
      am5geodata_indiaHigh.features.map((f) => [f.id, f.properties.name])
    )

    const applySelection = (stateName) => {
      polygonSeries.mapPolygons.each((p) => {
        p.set('active', false)
      })
      if (!stateName) return
      const ids = STATE_TO_IDS[stateName] || []
      polygonSeries.mapPolygons.each((p) => {
        const pid = p.dataItem ? p.dataItem.get('id') : null
        if (ids.includes(pid)) {
          p.set('active', true)
          polygonSeries.children.moveValue(p)
        }
      })
    }
    applySelectionRef.current = applySelection

    polygonSeries.mapPolygons.each((polygon) => {
      const id = polygon.dataItem ? polygon.dataItem.get('id') : null
      const value = polygon.dataItem ? polygon.dataItem.get('value') || 0 : 0
      const name = nameById.get(id) || ''
      polygon.setAll({
        fill: am5.color(lerpColor(maxCount === 0 ? 0 : value / maxCount)),
        stroke: am5.color('#9A968E'),
        strokeWidth: 0.5,
        interactive: true,
        tooltipText: `${name}: ${value} reports`,
      })
      polygon.states.create('active', {
        scale: 1.05,
        stroke: am5.color('#1A1A1A'),
        strokeWidth: 1,
      })
      polygon.events.on('click', () => {
        const state = id ? ID_TO_STATE[id] : null
        applySelection(state)
        if (onSelectState) onSelectState(state)
      })
    })

    return () => {
      applySelectionRef.current = null
      root.dispose()
    }
  }, [stateData, onSelectState])

  useEffect(() => {
    if (applySelectionRef.current) applySelectionRef.current(selectedState)
  }, [selectedState])

  return <div ref={divRef} className="h-[520px] w-full" />
}

import { useState, useEffect } from 'react'

export default function DubaiClock() {
  const [timeData, setTimeData] = useState(() => getDubaiTime())

  function getDubaiTime() {
    const now = new Date()
    const weekday = now.toLocaleDateString('en-US', { timeZone: 'Asia/Dubai', weekday: 'short' })
    const date = now.toLocaleDateString('en-US', { timeZone: 'Asia/Dubai', day: '2-digit', month: 'short', year: 'numeric' })
    const time = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    return { weekday, date, time }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeData(getDubaiTime())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: 20,
        fontSize: 12.5,
        fontWeight: 600,
        color: '#065F46',
        fontFamily: "'Poppins', system-ui, sans-serif",
        boxShadow: '0 1px 2px rgba(16, 185, 129, 0.06)',
      }}
      title="Real-time Dubai Local Time (GST / UTC+4)"
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#10B981',
          boxShadow: '0 0 6px #10B981',
          flexShrink: 0,
        }}
      />
      <span style={{ color: '#047857' }}>
        {timeData.weekday}, {timeData.date}
      </span>
      <span style={{ color: '#A7F3DC' }}>|</span>
      <span style={{ color: '#065F46', fontWeight: 700, letterSpacing: '0.2px' }}>
        {timeData.time} <span style={{ fontSize: 10, color: '#059669', textTransform: 'uppercase' }}>GST</span>
      </span>
    </div>
  )
}

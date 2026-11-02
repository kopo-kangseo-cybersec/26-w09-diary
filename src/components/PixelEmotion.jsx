const faces = {
  joy: { face: '#f5cb54', eyes: '#49351f', mouth: '#49351f' },
  calm: { face: '#8fd3ca', eyes: '#24534f', mouth: '#24534f' },
  sad: { face: '#8fc8f0', eyes: '#23476b', mouth: '#23476b', tear: '#3e95d3' },
  angry: { face: '#f08c83', eyes: '#641f32', mouth: '#641f32' },
  anxious: { face: '#c4a4e7', eyes: '#47315f', mouth: '#47315f', tear: '#73bde5' },
}

function PixelEmotion({ emotion, className = 'size-8' }) {
  const colors = faces[emotion] ?? faces.calm

  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${emotion} 픽셀 감정 아이콘`}
    >
      <path
        fill="#38284c"
        d="M4 1h8v1h2v2h1v8h-1v2h-2v1H4v-1H2v-2H1V4h1V2h2z"
      />
      <path
        fill={colors.face}
        d="M4 2h8v1h2v2h1v6h-1v2h-2v1H4v-1H2v-2H1V5h1V3h2z"
      />
      {emotion === 'angry' ? (
        <path fill={colors.eyes} d="M3 5h4v1h1v1H6V6H3zm6 1h1V5h4v1h-3v1H9z" />
      ) : emotion === 'calm' ? (
        <path fill={colors.eyes} d="M3 6h1v1h3V6h1v2H3zm6 0h1v1h3V6h1v2H9z" />
      ) : emotion === 'anxious' ? (
        <path fill={colors.eyes} d="M4 5h2v1h1v2H6V7H5v1H4zm5 1h1V5h2v1h1v2h-1V7h-1v1h-1z" />
      ) : (
        <path fill={colors.eyes} d="M4 5h2v3H4zm6 0h2v3h-2z" />
      )}
      {emotion === 'joy' ? (
        <path fill={colors.mouth} d="M4 9h2v1h4V9h2v2h-1v1H5v-1H4z" />
      ) : emotion === 'calm' ? (
        <path fill={colors.mouth} d="M6 10h4v1H6z" />
      ) : emotion === 'sad' ? (
        <path fill={colors.mouth} d="M5 11v-1h2V9h2v1h2v1z" />
      ) : emotion === 'angry' ? (
        <path fill={colors.mouth} d="M5 10h6v2h-1v1H6v-1H5z" />
      ) : (
        <path fill={colors.mouth} d="M6 10h1v2h2v-2h1v3H6z" />
      )}
      {colors.tear && (
        <path fill={colors.tear} d="M12 8h2v2h1v2h-1v1h-2v-1h-1v-2h1z" />
      )}
    </svg>
  )
}

export default PixelEmotion

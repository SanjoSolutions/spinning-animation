import { convertDegreesToRadian } from './unnamed/convertDegreesToRadian.js'
import { createFullDocumentCanvas } from './unnamed/createFullDocumentCanvas/createFullDocumentCanvas.js'
import { animate } from './unnamed/packages/animate/animate.js'
import { randomFloat } from './unnamed/randomFloat.js'
import { randomInteger } from './unnamed/randomInteger.js'

export async function main() {
  const { canvas, context } = createFullDocumentCanvas()
  document.body.appendChild(canvas)
  animate(render)

  let copyAngle = convertDegreesToRadian(60)

  let lastPositions = []

  let angle = 0
  let radius = 100

  function generateTargetRadius() {
    return randomInteger(0, Math.min(window.innerWidth / 2, window.innerHeight / 2))
  }

  let targetRadius = generateTargetRadius()
  const RADIUS_CHANGE = 1

  function determineChange(current, target, baseChange) {
    let change
    if (current < target) {
      change = baseChange
    } else if (current > target) {
      change = -baseChange
    } else {
      change = 0
    }
    return change
  }

  function determineRadiusChange(radius, nextRadius) {
    return determineChange(radius, nextRadius, RADIUS_CHANGE)
  }

  let radiusChange = determineRadiusChange(radius, targetRadius)

  function generateTargetAngleIncreasePerSecond() {
    return randomFloat(convertDegreesToRadian(30), convertDegreesToRadian(120))
  }

  let targetAngleIncreasePerSecond = generateTargetAngleIncreasePerSecond()

  const ANGLE_CHANGE = convertDegreesToRadian(1)

  function determineAngleIncreasePerSecondChange(angleIncreasePerSecond, targetAngleIncreasePerSecond) {
    return determineChange(angleIncreasePerSecond, targetAngleIncreasePerSecond, ANGLE_CHANGE)
  }

  let angleIncreasePerSecond = 0
  let angleIncreasePerSecondChange = determineAngleIncreasePerSecondChange(
    angleIncreasePerSecond,
    targetAngleIncreasePerSecond,
  )

  function render(ellapsedTime) {
    // Consider ellapsedTime
    radius += radiusChange
    if (Math.abs(radius - targetRadius) < RADIUS_CHANGE) {
      targetRadius = generateTargetRadius()
      radiusChange = determineRadiusChange(radius, targetRadius)
    }

    angle = (angle + (ellapsedTime / 1000) * angleIncreasePerSecond) % (2 * Math.PI)

    angleIncreasePerSecond += angleIncreasePerSecondChange
    if (Math.abs(angleIncreasePerSecond - targetAngleIncreasePerSecond) < ANGLE_CHANGE) {
      targetAngleIncreasePerSecond = generateTargetAngleIncreasePerSecond()
      angleIncreasePerSecondChange = determineAngleIncreasePerSecondChange(
        angleIncreasePerSecond,
        targetAngleIncreasePerSecond,
      )
    }

    // context.fillStyle = 'rgba(255, 255, 255, 0.01)'
    // context.fillRect(0, 0, window.innerWidth, window.innerHeight)
    context.clearRect(0, 0, window.innerWidth, window.innerHeight)

    function calculatePosition({ angle, radius }) {
      const x = window.innerWidth / 2 + radius * Math.cos(angle)
      const y = window.innerHeight / 2 + radius * Math.sin(angle)
      return { x, y }
    }

    function calculateDrawAngle(angle, copyNumber) {
      return angle + (copyNumber - 1) * copyAngle
    }

    function draw({ angle, radius }, { angle: lastAngle, radius: lastRadius }) {
      let numberOfCopies = Math.floor(convertDegreesToRadian(360) / copyAngle)
      for (let copyNumber = 1; copyNumber <= numberOfCopies; copyNumber++) {
        const lastDrawAngle = calculateDrawAngle(lastAngle, copyNumber)
        const drawAngle = calculateDrawAngle(angle, copyNumber)
        const { x: lastX, y: lastY } = calculatePosition({ angle: lastDrawAngle, radius: lastRadius })
        const { x, y } = calculatePosition({ angle: drawAngle, radius })
        context.beginPath()
        context.moveTo(lastX, lastY)
        context.lineTo(x, y)
        context.stroke()
      }
    }

    const positions = lastPositions.concat([{ radius, angle }])
    const alphaDelta = 1 / (positions.length - 1)

    for (let index = 0; index < positions.length; index++) {
      const position = positions[index]
      const lastPosition = index >= 1 ? positions[index - 1] : position
      context.strokeStyle = `rgba(0, 0, 0, ${ 1.0 - alphaDelta * (positions.length - 1 - index) })`
      draw(position, lastPosition)
    }

    lastPositions.push({
      angle,
      radius,
    })
    const MAX_LAST_POSITIONS = 30
    if (lastPositions.length > MAX_LAST_POSITIONS) {
      lastPositions = lastPositions.slice(lastPositions.length - MAX_LAST_POSITIONS)
    }
  }
}

import { Injectable } from 'cewdi'
import { svg, SVGTemplateResult } from 'lit-element'
import { DurationDenomination } from '../../common/duration-denomination'
import { DrawnNoteResult } from './drawn-note-result'

@Injectable()
export class NoteDrawer {

    drawNote({
        centerX,
        centerY,
        spaceBetweenStaffLines,
        duration,
        stemDirection
    }: {
        centerX: number,
        centerY: number,
        spaceBetweenStaffLines: number,
        duration: DurationDenomination,
        stemDirection: 'up' | 'down'
    }): DrawnNoteResult {
        const radiusY = spaceBetweenStaffLines * (2 / 3)
        const radiusX = spaceBetweenStaffLines
        const noteHead = this.getNoteHead(centerX, centerY, radiusX, radiusY, duration)
        const innerNoteHead = this.getNoteHeadNegativeSpace(centerX, centerY, radiusX, radiusY, duration)
        const stem = this.getStem(centerX, centerY, radiusX, radiusY, duration, stemDirection)
        return {
            template: svg`${noteHead}${innerNoteHead}${stem}`,
            // TEMP: NEED TO ACCOUNT FOR STEM FLAG
            width: radiusX * 2
        }
    }

    drawRest(): SVGTemplateResult {
        throw new Error('not implemented')
    }

    private getNoteHead(
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        duration: DurationDenomination): SVGTemplateResult {
            const transform = duration === 16 ? '' : `rotate(-22.5 ${centerX} ${centerY})`
            return svg`
            <ellipse transform=${transform}
                cx=${centerX}
                cy=${centerY}
                rx=${radiusX}
                ry=${radiusY}></ellipse>`
    }

    private getNoteHeadNegativeSpace(
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        duration: DurationDenomination): SVGTemplateResult {
            if (duration === 16) {
                return svg`
                    <ellipse transform="rotate(-22.5 ${centerX} ${centerY})"
                        class="negative-space"
                        cx=${centerX}
                        cy=${centerY}
                        rx=${radiusX / 2}
                        ry=${radiusY}>`
            } else if (duration === 8) {
                return svg`<circle class="negative-space" cx=${centerX} cy=${centerY} r=${radiusX * 0.75}></circle>`
            }
            return svg``
    }

    private getStem(
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        duration: DurationDenomination,
        stemDirection: 'up' | 'down'
    ): SVGTemplateResult {
        if (duration === 16) {
            return svg``
        }

        const strokeWidth = radiusY / 2
        const stemLength = radiusY * 10
        const stemX = centerX + radiusX * (stemDirection === 'up' ? 1 : -1)
        const stemY1 = centerY
        const stemY2 = centerY + stemLength * (stemDirection === 'up' ? -1 : 1)

        const stemTemplate = svg`
            <line stroke-width=${strokeWidth}
                stroke-linecap="round"
                x1=${stemX}
                y1=${stemY1}
                x2=${stemX}
                y2=${stemY2}></line>`
        const flags = this.getFlags(stemX, stemY2, radiusX, radiusY, duration, strokeWidth, stemDirection)

        return svg`${stemTemplate}${flags}`
    }

    private getFlags(
        stemX: number,
        stemY2: number,
        radiusX: number,
        radiusY: number,
        duration: DurationDenomination,
        strokeWidth: number,
        stemDirection: 'up' | 'down'
    ): SVGTemplateResult {
        if (duration !== 1 && duration !== 2) {
            return svg``
        }
        const directionFactor = (stemDirection === 'up' ? 1 : -1)
        const startX = stemX
        const startY = stemY2
        const xReference = radiusX / 2
        const yReference = radiusY * 1.5
        const initialLineEndX = startX + xReference
        const initialLineEndY = startY + yReference * directionFactor
        const firstCubicBezierControlPointX = initialLineEndX + xReference
        const cubicBezierXs = [
            firstCubicBezierControlPointX,
            firstCubicBezierControlPointX + xReference,
            firstCubicBezierControlPointX + (xReference / 1.5)
        ]
        const firstCubicBezierControlPointY = initialLineEndY + (yReference * directionFactor)
        const cubicBezierYs = [
            firstCubicBezierControlPointY,
            firstCubicBezierControlPointY + (yReference * directionFactor),
            firstCubicBezierControlPointY + (yReference * 1.5 * directionFactor)
        ]

        const firstFlag = svg`
            <path stroke-width=${strokeWidth}
                stroke-linecap="round"
                d="M ${stemX} ${stemY2} L ${initialLineEndX} ${initialLineEndY} ${this.getCubicBezier(
                    cubicBezierXs,
                    cubicBezierYs)}"></path>`

        const secondFlagYAdjustment = yReference * 1.5 * directionFactor
        const secondFlag = duration === 1
            ? svg`
                <path stroke-width=${strokeWidth}
                    stroke-linecap="round"
                    d="M ${stemX} ${stemY2} L ${initialLineEndX} ${initialLineEndY + secondFlagYAdjustment} ${
                        this.getCubicBezier(
                            cubicBezierXs,
                            cubicBezierYs.map(y => y + secondFlagYAdjustment))}"></path>`
            : svg``

        return svg`${firstFlag}${secondFlag}`
    }

    private getCubicBezier(xValues: number[], yValues: number[]): string {
        return 'C ' + xValues.map((x, i) => `${x} ${yValues[i]}`).join(',')
    }
}

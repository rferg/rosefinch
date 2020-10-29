import { Injectable } from 'cewdi'
import { svg, SVGTemplateResult } from 'lit-element'
import { DurationDenomination } from '../../common/duration-denomination'

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
    }): SVGTemplateResult {
        const radiusY = spaceBetweenStaffLines
        const radiusX = spaceBetweenStaffLines * 1.5
        const noteHead = this.getNoteHead(centerX, centerY, radiusX, radiusY, duration)
        const innerNoteHead = this.getInnerNoteHeadShape(centerX, centerY, radiusX, radiusY, duration)
        const stem = this.getStem(centerX, centerY, radiusX, radiusY, duration, stemDirection)
        return svg`${noteHead}${innerNoteHead}${stem}`
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
            const transform = duration === 1 ? '' : `rotate(-22.5 ${centerX} ${centerY})`
            return svg`
            <ellipse transform=${transform}
                cx=${centerX}
                cy={centerY}
                rx=${radiusX}
                ry=${radiusY}></ellipse>`
    }

    private getInnerNoteHeadShape(
        centerX: number,
        centerY: number,
        radiusX: number,
        radiusY: number,
        duration: DurationDenomination): SVGTemplateResult {
            if (duration === 1) {
                return svg`
                    <ellipse class="negative-space" cx=${centerX} cy=${centerY} rx=${radiusX / 2} ry=${radiusY}>`
            } else if (duration === 2) {
                return svg`<circle class="negative-space" cx=${centerX} cy=${centerY} r=${radiusX}></circle>`
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
        if (duration === 1) {
            return svg``
        }

        const strokeWidth = radiusY / 5
        const stemLength = radiusY * 6
        const stemX = centerX + (radiusX - (strokeWidth / 2)) * (stemDirection === 'up' ? 1 : -1)
        const stemY1 = centerY
        const stemY2 = centerY + stemLength * (stemDirection === 'up' ? -1 : 1)

        const stemTemplate = svg`
            <line stoke-width=${strokeWidth}
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
        if (duration !== 8 && duration !== 16) {
            return svg``
        }
        const directionFactor = (stemDirection === 'up' ? 1 : -1)
        const startX = stemX
        const startY = stemY2
        const initialLineEndX = startX + (radiusX / 5)
        const initialLineEndY = startY + (radiusY / 2) * directionFactor
        const firstCubicBezierControlPointX = initialLineEndX + (radiusX / 5)
        const cubicBezierXs = [
            firstCubicBezierControlPointX,
            firstCubicBezierControlPointX + radiusX,
            firstCubicBezierControlPointX + (radiusX / 1.5)
        ]
        const firstCubicBezierControlPointY = initialLineEndY + ((radiusY / 2) * directionFactor)
        const cubicBezierYs = [
            firstCubicBezierControlPointY,
            firstCubicBezierControlPointY + (radiusY * directionFactor),
            firstCubicBezierControlPointY + (radiusY * 1.5 * directionFactor)
        ]

        const firstFlag = svg`
            <path stroke-width=${strokeWidth}
                stroke-linecap="round"
                d="L ${initialLineEndX} ${initialLineEndY} ${this.getCubicBezier(cubicBezierXs, cubicBezierYs)}"></path>`

        const secondFlagYAdjustment = radiusY * 1.5 * directionFactor
        const secondFlag = duration === 16
            ? svg`
                <path stroke-width=${strokeWidth}
                    stroke-linecap="round"
                    d="L ${initialLineEndX} ${initialLineEndY} ${this.getCubicBezier(
                        cubicBezierXs,
                        cubicBezierYs.map(y => y + secondFlagYAdjustment))}"></path>`
            : svg``

        return svg`${firstFlag}${secondFlag}`
    }

    private getCubicBezier(xValues: number[], yValues: number[]): string {
        return 'C ' + xValues.map((x, i) => `${x} ${yValues[i]}`).join(',')
    }
}

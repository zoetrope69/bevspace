import SVG from 'preact-svg';
import { h, Component } from 'preact';
import style from './style';

// code based on http://jsbin.com/cibicecuto

export default class Progress extends Component {

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians)),
    };
  }

  describeArc(x, y, radius, startAngle, endAngle){
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);

    const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
      'M', start.x, start.y,
      'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
    ].join(' ');

    return d;
  }

  render() {
    let { percent, strokeWidth, radius } = this.props;

    percent = percent || 0;
    strokeWidth = strokeWidth || 10;
    radius = radius || 50;

    const dashLength = Math.PI * (radius* 2);
    const dashOffset = ((100 - percent) / 100) * dashLength;

    return (
      <SVG width={(radius * 2) + strokeWidth} height={(radius * 2) + strokeWidth} class={style.progress}>
        <circle
          class={style.container}
          cx={radius + (strokeWidth / 2)}
          cy={radius + (strokeWidth / 2)}
          r={radius}
          stroke-width={strokeWidth}
          />
        <path
          class={style.bar}
          d={this.describeArc(radius + (strokeWidth / 2),
                              radius + (strokeWidth / 2),
                              radius, 0,
                              ((percent - 0.001) / 100) * 360)}
          stroke-width={strokeWidth}
          />
        {radius >= 40 && (
        <text
          class={style.text}
          x="50%"
          y="50%"
          text-anchor="middle"
          dy=".4em"
          >
          {percent.toFixed(0)}%
        </text>
        )}
      </SVG>
    );
  }
}

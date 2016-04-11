import SVG from 'preact-svg';
import { h, Component } from 'preact';
import style from './style';
import moment from 'moment';

import Progress from '../Progress';

export default class Brew extends Component {

  render() {
    const { id, brews, recipes } = this.props;

    const brew = brews.find((brew) => brew._id === id);
    const recipe = recipes.find((recipe) => recipe._id === brew.recipe);

    let output;

    if (brew && recipe) {

      // find how many items have been completed in timeline
      let completedItems = 0;
      recipe.timeline.map(item => {
        const relativeStartTime = moment(brew.startTime + item.duration.raw);
        const itemDuration = relativeStartTime - moment();
        const completedItem = itemDuration < 0;

        item.relativeDuration = itemDuration;
        item.relativeStartTime = relativeStartTime;
        item.completed = completedItem;

        if (completedItem) {
          completedItems++;
        }

        return item;
      });

      const percentCompleted = (completedItems / recipe.timeline.length) * 100;

      output = (
      <div>
        <div class={style.info} style={{ overflow: 'hidden' }}>
          <div style={{ float: 'left', width: '20%' }}>
            <Progress percent={percentCompleted} strokeWidth={5} radius={50} />
          </div>
          <div style={{ float: 'left', width: '80%' }}>
            <h1>{recipe.name}</h1>
          </div>
        </div>

        <ul class={style.timeline}>
          {recipe.timeline.map((item) => (
            <li class={style.item} style={item.completed && { opacity: 0.5 }}>
              <strong>{item.relativeStartTime.calendar()}</strong>
              <br />
              <span class={style.description}>{item.description}</span>
              <time>{moment.duration(item.relativeDuration).humanize(true)}</time>
            </li>
          ))}
        </ul>
      </div>
      );
    } else {
      output = <p>Loading...</p>;
    }

    return (
      <div class={style.brew}>
        {output}
      </div>
    );
  }
}

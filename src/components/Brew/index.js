import SVG from 'preact-svg';
import { h, Component } from 'preact';
import style from './style';
import moment from 'moment';

import Loading from '../Loading';
import Progress from '../Progress';

export default class Brew extends Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);

    this.state = {};
  }

  handleClick(event) {
    const { id, brews, startBrew } = this.props;

    const brew = brews.find((brew) => brew._id === id);

    // if there's no start time (the brew hasnt started) then start the brew
    if (!brew.startTime) {
      startBrew(brew);
    }

    event.preventDefault();
  }

  render() {
    const { id, brews, recipes, user } = this.props;

    // if there's no recipes or brews loaded, show a loading message
    if (!recipes.length || !brews.length) {
      return <Loading />;
    }

    const brew = brews.find((brew) => brew._id === id);
    const recipe = recipes.find((recipe) => recipe._id === brew.recipe);

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

    return (
    <div class={style.brew}>
      <div class={style.info} style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
        {brew.startTime ? (
          <div style={{ transform: 'translateY(.5em)' }}>
            <Progress percent={percentCompleted} strokeWidth={5} radius={50} />
          </div>
        ) : (
          <button class={`${style.button} ${style.buttonSuccess}`} onclick={this.handleClick}>Start brew</button>
        )}
        </div>
        <div style={{ flex: 1 }}>
          <h1>{recipe.name}</h1>
        </div>
      </div>


      <ul class={style.timeline}>
        {recipe.timeline.map((item) => (
          <li class={`${style.item} ${item.completed && style.itemCompleted}`}>
            <div>
              {item.completed && '✔'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <time class={style.timeToStart}>{item.relativeStartTime.calendar()} ({moment.duration(item.relativeDuration).humanize(true)})</time>
              <span class={style.description}>{item.description}</span>
            </div>
            <div>
              <time></time>
            </div>
          </li>
        ))}
      </ul>
    </div>
    );
  }
}

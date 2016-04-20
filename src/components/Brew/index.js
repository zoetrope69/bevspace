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

    // if there's no recipes or brews loaded, show a placeholders for optimistic ui
    if (!recipes.length || !brews.length) {

      // generate some placeholders for optimistically loading
      const placeholders = [];
      const placeholdersAmount =  25;
      for (let i = 0; i < placeholdersAmount; i++) {
        placeholders.push(<div class={style.placeholder} />);
      }

      return <div>{placeholders}</div>;
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
      <div class={style.info}>
        <div>
          <h1 class={style.name}>{recipe.name}</h1>
          <h2 class={style.author}>{recipe.author}</h2>
        </div>
        <div>
        {brew.startTime ? (
          <div>
            <Progress percent={percentCompleted} strokeWidth={5} radius={50} />
          </div>
        ) : (
          <button class={`${style.button} ${style.buttonSuccess}`} onclick={this.handleClick}>Start brew</button>
        )}
        </div>
      </div>

      <ul class={style.timeline}>
        {recipe.timeline.map((item) => (
          <li class={`${style.item} ${item.completed && style.itemCompleted}`}>
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <time class={style.timeToStart}>{item.relativeStartTime.calendar()} ({moment.duration(item.relativeDuration).humanize(true)})</time>
              <span class={style.description}>{item.description}</span>
            </div>
            <div>
              {item.completed && '✔'}
            </div>
          </li>
        ))}
      </ul>
    </div>
    );
  }
}

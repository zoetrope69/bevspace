import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';
import moment from 'moment';

import Loading from '../Loading';
import Progress from '../Progress';

export default class Brews extends Component {

  render() {
    let { user, brews, recipes } = this.props;

    // if there's no recipes or brews loaded, show a loading message
    if (!recipes.length || !brews.length) {
      return <Loading />;
    }

    let brewCount = 0;

    return (
    <div class={style.brews}>
      <h1>Brews</h1>
      <ul class={style.list}>
      {brews.map((brew, i) => {
        // if the brew isn't valid (duck typing here) or it's not ya brew
        if (!brew.recipe || brew.user !== user.name) {
          return false;
        }

        brewCount++;

        const recipe = recipes.find((recipe) => recipe._id === brew.recipe);

        let percentCompleted;

        let state = 'Ready';
        let stateStyle = style.stateReady;
        if (brew.done) {
          state = 'Done';
          stateStyle = style.stateDone;
        } else if (brew.startTime) {
          state = 'Brewing';
          stateStyle = style.stateBrewing;

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

          percentCompleted = (completedItems / recipe.timeline.length) * 100;
        }

        return (
        <li class={style.list}>
          <Link class={`${style.button} ${style.item}`}
                href={`/brew/${brew._id}`}>
            <div>
              <span class={style.name}>{recipe.name}</span>
              <small class={style.author}>{recipe.author}</small>
            </div>
            <div style={{ paddingRight: 0, paddingTop: '1.5em' }}>
              <span>
                {percentCompleted && <div class={style.progress}><Progress percent={percentCompleted} strokeWidth={3} radius={6} /></div>}
              </span>
              <span class={`${style.state} ${stateStyle}`}>{state}</span>
            </div>
          </Link>
        </li>
        );
      })}
      </ul>
    </div>
    );
  }
}

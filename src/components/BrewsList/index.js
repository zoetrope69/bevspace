import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';
import moment from 'moment';

import Progress from '../Progress';

export default class RecipesList extends Component {

  render() {
    const { user, brews, recipes, loading } = this.props;

    // generate some placeholders for optimistically loading
    const placeholders = [];
    const placeholdersAmount =  25;
    for (let i = 0; i < placeholdersAmount; i++) {
      placeholders.push(<div class={style.placeholder} />);
    }

    return (
      <ul class={style.list}>
      {loading ? placeholders : brews.map((brew, i) => {
        // if the brew isn't valid (duck typing here) or it's not ya brew
        if (!brew || !brew.recipe || brew.user !== user.name) {
          return <div />;
        }

        const recipe = recipes.find((recipe) => recipe._id === brew.recipe);

        let percentCompleted;

        // determine the state of the brew
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
                style={recipe.color && { borderLeftColor: recipe.color.style }}
                href={`/brew/${brew._id}`}>
            <div>
              <span class={recipe.name}>{recipe.name}</span>
              {recipe.author && <small class={style.author}>{recipe.author}</small>}
            </div>
            <div style={{ paddingRight: 0, paddingTop: '1.5em' }}>
              <span class={`${style.state} ${stateStyle}`}>{state}</span>
              <span>
                {percentCompleted && <div class={style.progress}><Progress percent={percentCompleted} strokeWidth={3} radius={6} /></div>}
              </span>
            </div>
          </Link>
        </li>
        );
      })}
      </ul>
    );
  }
}

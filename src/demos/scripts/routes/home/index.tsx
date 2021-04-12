import React from 'react';
import { Link } from 'react-router-dom';
import { createBEM } from '../../../../utils/bem';
import logoImg from '../../../assets/logo.png';
import githubLogo from '../../../assets/github.svg';
import './index.scss';

const bem = createBEM('demo-home');

function Arrow(): JSX.Element {
  return (
    <svg viewBox="0 0 1024 1024" className="demo-home-nav__icon">
      <path
        fill="#B6C3D2"
        d="M601.1 556.5L333.8 289.3c-24.5-24.5-24.5-64.6 0-89.1s64.6-24.5 89.1 0l267.3 267.3c24.5 24.5 24.5 64.6 0 89.1-24.5 24.4-64.6 24.4-89.1-.1z"
      ></path>
      <path
        fill="#B6C3D2"
        d="M690.2 556.5L422.9 823.8c-24.5 24.5-64.6 24.5-89.1 0s-24.5-64.6 0-89.1l267.3-267.3c24.5-24.5 64.6-24.5 89.1 0 24.5 24.6 24.5 64.6 0 89.1z"
      ></path>
    </svg>
  );
}

export class HomeRouteComponent extends React.PureComponent {
  render(): JSX.Element {
    return (
      <div className={bem()}>
        <h1>
          <img src={logoImg} />
          <span>Pant React</span>
          <a className="github" href="https://github.com/webyom/pant-react" target="_blank">
            <img src={githubLogo} />
          </a>
        </h1>
        <h2>
          Mobile UI Components built on React
          <br />
          Ported from{' '}
          <a href="https://github.com/youzan/vant" target="_blank">
            Vant
          </a>
        </h2>

        <section>
          <h3>Basic Components</h3>
          <Link to="/button/">
            Button <Arrow />
          </Link>
          <Link to="/cell/">
            Cell <Arrow />
          </Link>
          <Link to="/img/">
            Image <Arrow />
          </Link>
          <Link to="/layout/">
            Layout <Arrow />
          </Link>
          <Link to="/popup/">
            Popup <Arrow />
          </Link>
          <Link to="/styles/">
            Built-in Styles <Arrow />
          </Link>
        </section>

        <section>
          <h3>Form Components</h3>
          <Link to="/checkbox/">
            Checkbox <Arrow />
          </Link>
          <Link to="/datetime-picker/">
            DatetimePicker <Arrow />
          </Link>
          <Link to="/field/">
            Field <Arrow />
          </Link>
          <Link to="/form/">
            Form <Arrow />
          </Link>
          <Link to="/number-keyboard/">
            NumberKeyboard <Arrow />
          </Link>
          <Link to="/password-input/">
            PasswordInput <Arrow />
          </Link>
          <Link to="/picker/">
            Picker <Arrow />
          </Link>
          <Link to="/radio/">
            Radio <Arrow />
          </Link>
          <Link to="/search/">
            Search <Arrow />
          </Link>
          <Link to="/search-picker/">
            SearchPicker <Arrow />
          </Link>
          <Link to="/switch/">
            Switch <Arrow />
          </Link>
        </section>

        <section>
          <h3>Action Components</h3>
          <Link to="/action-sheet/">
            ActionSheet <Arrow />
          </Link>
          <Link to="/dialog/">
            Dialog <Arrow />
          </Link>
          <Link to="/loading/">
            Loading <Arrow />
          </Link>
          <Link to="/notify/">
            Notify <Arrow />
          </Link>
          <Link to="/overlay/">
            Overlay <Arrow />
          </Link>
          <Link to="/pull-refresh/">
            PullRefresh <Arrow />
          </Link>
          <Link to="/toast/">
            Toast <Arrow />
          </Link>
        </section>

        <section>
          <h3>Display Components</h3>
          <Link to="/data-list/">
            DataList <Arrow />
          </Link>
          <Link to="/lazyload/">
            Lazyload <Arrow />
          </Link>
          <Link to="/list/">
            List <Arrow />
          </Link>
          <Link to="/skeleton/">
            Skeleton <Arrow />
          </Link>
          <Link to="/sticky/">
            Sticky <Arrow />
          </Link>
          <Link to="/tag/">
            Tag <Arrow />
          </Link>
        </section>

        <section>
          <h3>Navigation Components</h3>
          <Link to="/tab/">
            Tab <Arrow />
          </Link>
        </section>

        <section>
          <h3>Business Components</h3>
          <Link to="/card/">
            Card <Arrow />
          </Link>
          <Link to="/submit-bar/">
            SubmitBar <Arrow />
          </Link>
        </section>
      </div>
    );
  }
}

import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { closeAllactionSheets } from '../../action-sheet';
import { closeAllDialogs } from '../../dialog';
import { clearAllNotifies } from '../../notify';
import { clearAllToasts } from '../../toast';
import { HomeRouteComponent } from './routes/home';
import { ActionSheetRouteComponent } from '../../action-sheet/demo';
import { ButtonRouteComponent } from '../../button/demo';
import { CardRouteComponent } from '../../card/demo';
import { CellRouteComponent } from '../../cell/demo';
import { CheckboxRouteComponent } from '../../checkbox/demo';
import { DatetimePickerRouteComponent } from '../../datetime-picker/demo';
import { DialogRouteComponent } from '../../dialog/demo';
import { FieldRouteComponent } from '../../field/demo';
import { FormRouteComponent } from '../../form/demo';
import { ImgRouteComponent } from '../../img/demo';
import { LayoutRouteComponent } from '../../col/demo';
import { LazyloadRouteComponent } from '../../lazyload/demo';
import { ListRouteComponent } from '../../list/demo';
import { LoadingRouteComponent } from '../../loading/demo';
import { NotifyRouteComponent } from '../../notify/demo';
import { NumberKeyboardRouteComponent } from '../../number-keyboard/demo';
import { OverlayRouteComponent } from '../../overlay/demo';
import { PasswordInputRouteComponent } from '../../password-input/demo';
import { PickerRouteComponent } from '../../picker/demo';
import { PopupRouteComponent } from '../../popup/demo';
import { PullRefreshRouteComponent } from '../../pull-refresh/demo';
import { RadioRouteComponent } from '../../radio-group/demo';
import { SearchRouteComponent } from '../../search/demo';
import { SkeletonRouteComponent } from '../../skeleton/demo';
import { StickyRouteComponent } from '../../sticky/demo';
import { StylesRouteComponent } from '../../styles/demo';
import { SubmitBarRouteComponent } from '../../submit-bar/demo';
import { SwitchRouteComponent } from '../../switch/demo';
import { TabRouteComponent } from '../../tab/demo';
import { TagRouteComponent } from '../../tag/demo';
import { ToastRouteComponent } from '../../toast/demo';
import { NotFoundRouteComponent } from './routes/404';

export class RootComponent extends React.Component {
  private bindedOnHashChange = this.onHashChange.bind(this);

  componentDidMount(): void {
    window.addEventListener('hashchange', this.bindedOnHashChange);
  }

  componentWillUnmount(): void {
    window.removeEventListener('hashchange', this.bindedOnHashChange);
  }

  private onHashChange(): void {
    const parentRoute = (parent as any).$componentRoute;
    if (parentRoute) {
      parentRoute(location.hash);
      this.onRouteChange();
    }
  }

  private onRouteChange(): void {
    closeAllactionSheets();
    closeAllDialogs();
    clearAllNotifies();
    clearAllToasts();
  }

  render(): JSX.Element {
    return (
      <Router>
        <Switch>
          <Route path="/action-sheet/">
            <ActionSheetRouteComponent />
          </Route>
          <Route path="/button/">
            <ButtonRouteComponent />
          </Route>
          <Route path="/card/">
            <CardRouteComponent />
          </Route>
          <Route path="/cell/">
            <CellRouteComponent />
          </Route>
          <Route path="/checkbox/">
            <CheckboxRouteComponent />
          </Route>
          <Route path="/datetime-picker/">
            <DatetimePickerRouteComponent />
          </Route>
          <Route path="/dialog/">
            <DialogRouteComponent />
          </Route>
          <Route path="/field/">
            <FieldRouteComponent />
          </Route>
          <Route path="/form/">
            <FormRouteComponent />
          </Route>
          <Route path="/img/">
            <ImgRouteComponent />
          </Route>
          <Route path="/lazyload/">
            <LazyloadRouteComponent />
          </Route>
          <Route path="/layout/">
            <LayoutRouteComponent />
          </Route>
          <Route path="/list/">
            <ListRouteComponent />
          </Route>
          <Route path="/loading/">
            <LoadingRouteComponent />
          </Route>
          <Route path="/notify/">
            <NotifyRouteComponent />
          </Route>
          <Route path="/number-keyboard/">
            <NumberKeyboardRouteComponent />
          </Route>
          <Route path="/overlay/">
            <OverlayRouteComponent />
          </Route>
          <Route path="/password-input/">
            <PasswordInputRouteComponent />
          </Route>
          <Route path="/picker/">
            <PickerRouteComponent />
          </Route>
          <Route path="/popup/">
            <PopupRouteComponent />
          </Route>
          <Route path="/pull-refresh/">
            <PullRefreshRouteComponent />
          </Route>
          <Route path="/radio/">
            <RadioRouteComponent />
          </Route>
          <Route path="/search/">
            <SearchRouteComponent />
          </Route>
          <Route path="/sticky/">
            <StickyRouteComponent />
          </Route>
          <Route path="/switch/">
            <SwitchRouteComponent />
          </Route>
          <Route path="/tab/">
            <TabRouteComponent />
          </Route>
          <Route path="/tag/">
            <TagRouteComponent />
          </Route>
          <Route path="/toast/">
            <ToastRouteComponent />
          </Route>
          <Route path="/skeleton/">
            <SkeletonRouteComponent />
          </Route>
          <Route path="/styles/">
            <StylesRouteComponent />
          </Route>
          <Route path="/submit-bar/">
            <SubmitBarRouteComponent />
          </Route>
          <Route path="/" exact>
            <HomeRouteComponent />
          </Route>
          <Route path="*">
            <NotFoundRouteComponent />
          </Route>
        </Switch>
      </Router>
    );
  }
}

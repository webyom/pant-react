import React from 'react';
import clsx from 'clsx';
import { Search } from '../search';
import { i18n } from '../locale';
import { createBEM } from '../utils/bem';
import './index.scss';

export type SearchPickerProps = {
  title?: string;
  fullscreen?: boolean;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  cancelButtonText?: string;
  confirmButtonText?: string;
  onCancel?: (value: string[] | string) => void;
  onConfirm?: (value: string[] | string) => void;
  closePopup?: (confirm?: boolean) => void;
  onChange?: (value: string[] | string) => void;
};

type SearchPickerState = {
  pickerValue: string[];
};

const bem = createBEM('pant-search-picker');

export class SearchPicker extends React.Component<SearchPickerProps, SearchPickerState> {
  static defaultProps = {
    showToolbar: true,
    toolbarPosition: 'top',
  };

  constructor(props: SearchPickerProps) {
    super(props);
    this.state = {
      pickerValue: [],
    };
  }

  genToolbar(top?: boolean): JSX.Element {
    const props = this.props;
    if (!props.showToolbar) {
      return;
    }

    if (props.toolbarPosition === 'top') {
      if (top) {
        return (
          <div className={bem('toolbar')}>
            {[
              <button key="cancel" type="button" className={bem('cancel')} onClick={this.cancel.bind(this)}>
                {props.cancelButtonText || i18n().cancel}
              </button>,
              <div key="title" className={clsx(bem('title'), 'pant-ellipsis')}>
                {props.title}
              </div>,
              <button key="confirm" type="button" className={bem('confirm')} onClick={this.confirm.bind(this)}>
                {props.confirmButtonText || i18n().confirm}
              </button>,
            ]}
          </div>
        );
      }
    } else {
      if (top) {
        if (props.title) {
          return (
            <div className={bem('toolbar', { title: true })}>
              <div key="title" className={clsx(bem('title'), 'pant-ellipsis')}>
                {props.title}
              </div>
            </div>
          );
        }
      } else {
        return (
          <div className={bem('toolbar')}>
            {[
              <button key="cancel" type="button" className={bem('cancel')} onClick={this.cancel.bind(this)}>
                {props.cancelButtonText || i18n().cancel}
              </button>,
              <button key="confirm" type="button" className={bem('confirm')} onClick={this.confirm.bind(this)}>
                {props.confirmButtonText || i18n().confirm}
              </button>,
            ]}
          </div>
        );
      }
    }
  }

  confirm(): void {
    //
  }

  cancel(): void {
    //
  }

  render(): JSX.Element {
    const props = this.props;
    return (
      <div className={bem({ fullscreen: props.fullscreen })}>
        {this.genToolbar(true)}
        <Search />
        <div className={bem('content')}></div>
        {this.genToolbar()}
      </div>
    );
  }
}

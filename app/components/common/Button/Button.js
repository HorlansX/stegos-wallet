// @flow
import React, { Component } from 'react';
import { Link, LocationShape } from 'react-router-dom';
import ActiveElement from '../ActiveElement/ActiveElement';
import Icon from '../Icon/Icon';
import type { IconName } from '../Icon/IconName';
import styles from './Button.css';

export type ButtonType =
  | 'OutlineDisabled'
  | 'OutlinePrimary'
  | 'FilledPrimary'
  | 'FilledSecondary'
  | 'Invisible';

type ButtonProps = {
  disabled?: boolean,
  onClick?: MouseEvent => void,
  tabIndex?: number,
  icon?: IconName,
  iconRight?: IconName,
  iconRightMirrorHor?: boolean,
  elevated?: boolean,
  type?: ButtonType,
  style?: any,
  className?: string,
  link?: string | LocationShape,
  icoButton?: boolean,
  color?: string,
  submit?: boolean,
  priority?: number
};

class Button extends Component<ButtonProps> {
  props: ButtonProps;

  static defaultProps = {
    disabled: false,
    onClick: undefined,
    tabIndex: 0,
    icon: null,
    iconRight: null,
    iconRightMirrorHor: false,
    elevated: false,
    type: 'OutlineDisabled',
    style: null,
    className: '',
    link: null,
    icoButton: false,
    color: 'inherit',
    submit: false,
    priority: 0
  };

  constructor(props) {
    super(props);
    const { icoButton, icon } = props;
    if (icoButton && !icon) {
      throw new Error('Icon must be set for icon button');
    }
  }

  get submitPriority() {
    const { priority } = this.props;
    return priority;
  }

  onKeyPress(e: KeyboardEvent) {
    const { onClick, disabled } = this.props;
    return (
      !disabled && e.key === 'Enter' && typeof onClick === 'function' // &&
      // onClick()
    );
  }

  onClick() {
    const { onClick, disabled } = this.props;
    return !disabled && typeof onClick === 'function' && onClick();
  }

  renderIcon() {
    const { icon, color } = this.props;
    return <Icon name={icon} size={25} className={styles.Icon} color={color} />;
  }

  renderIconLeft() {
    const { icon } = this.props;
    return (
      <div style={{ marginRight: 'auto' }}>
        <Icon
          name={icon}
          size={25}
          style={{ marginRight: '20px' }}
          className={styles.Icon}
        />
      </div>
    );
  }

  renderIconRight() {
    const { iconRight, iconRightMirrorHor } = this.props;
    return (
      <div style={{ marginLeft: 'auto' }}>
        <Icon
          name={iconRight}
          size={25}
          style={{ marginLeft: '20px' }}
          className={styles.Icon}
          mirrorHor={iconRightMirrorHor}
        />
      </div>
    );
  }

  submit() {
    this.onClick();
  }

  render() {
    const {
      disabled,
      tabIndex,
      children,
      icon,
      iconRight,
      elevated,
      type,
      style,
      className,
      link,
      icoButton,
      submit
    } = this.props;
    let buttonTypeClass = '';
    switch (type) {
      case 'OutlineDisabled':
        buttonTypeClass = styles.OutlineDisabled;
        break;
      case 'FilledPrimary':
        buttonTypeClass = styles.FilledPrimary;
        break;
      case 'FilledSecondary':
        buttonTypeClass = styles.FilledSecondary;
        break;
      case 'Invisible':
        buttonTypeClass = styles.Invisible;
        break;
      default:
        buttonTypeClass = '';
    }

    const classes = [
      styles.Button,
      !icoButton ? buttonTypeClass : undefined,
      disabled ? styles.Disabled : undefined,
      elevated ? styles.Elevated : undefined,
      icoButton ? styles.IcoButton : undefined,
      className
    ];

    const ButtonWrapper = link ? Link : 'button';
    return (
      <ButtonWrapper
        className={classes.join(' ')}
        onClick={this.onClick.bind(this)}
        onKeyPress={this.onKeyPress.bind(this)}
        role="button"
        type={submit ? 'submit' : 'button'}
        tabIndex={tabIndex}
        style={style}
        to={link}
      >
        {icoButton && this.renderIcon()}
        {!icoButton && icon && this.renderIconLeft()}
        {!icoButton && children}
        {!icoButton && iconRight && this.renderIconRight()}
      </ButtonWrapper>
    );
  }
}

export default ActiveElement(Button);

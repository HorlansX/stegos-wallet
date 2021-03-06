// @flow
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import type { NodeStateType } from '../reducers/types';
import Header from './common/Header/Header';
import ProgressBar from './common/ProgressBar/ProgressBar';
import styles from './Sync.css';
import BootstrapWizard from './common/Wizard/BootstrapWizard';
import SyncFail from './SyncFail/SyncFail';

type Props = {
  node: NodeStateType,
  isFirstLaunch: boolean,
  runNode: () => void
};

export default class Sync extends Component<Props> {
  props: Props;

  componentDidMount(): void {
    const { runNode } = this.props;
    runNode();
  }

  render() {
    const { node, isFirstLaunch } = this.props;
    return (
      <div className={styles.Wrapper}>
        <Header />
        {isFirstLaunch && <BootstrapWizard step={2} />}
        {node.error && <SyncFail error={node.error} />}
        {!node.error && (
          <div className={styles.Main}>
            <span className={styles.Title}>
              <FormattedMessage
                id={
                  node.isSynced
                    ? 'synced.successfully'
                    : 'syncing.in.progress.description'
                }
              />
            </span>
            <div className={styles.ProgressBarWrapper}>
              <span className={styles.Progress}>{node.syncingProgress}%</span>
              <ProgressBar
                progress={node.syncingProgress}
                className={styles.ProgressBar}
              />
            </div>
            {!node.isSynced && (
              <span className={styles.Label}>
                <FormattedMessage id="syncing.please.wait" />
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
}

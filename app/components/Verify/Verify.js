// @flow
import { remote } from 'electron';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import fs from 'fs';
import Button from '../common/Button/Button';
import Input from '../common/Input/Input';
import Modal from '../common/Modal/Modal';
import styles from './Verify.css';
import { formatDigit } from '../../utils/format';
import { validateCertificate } from '../../actions/node';
import { POWER_DIVISIBILITY } from '../../constants/config';
import generateCertificatePdf from '../../utils/pdf';
import Busy from '../common/Busy/Busy';

type Props = {
  visible: boolean,
  waiting: boolean,
  onClose: () => void,
  verify: () => void,
  intl: any
};

class Verify extends Component<Props> {
  props: Props;

  state = {
    sender: '',
    senderError: '',
    recipient: '',
    recipientError: '',
    rvalue: '',
    rvalueError: '',
    utxo: '',
    utxoError: '',
    date: null,
    verified: null,
    amount: null,
    block: null,
    pdfData: null
  };

  close() {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  validate = () => {
    const { intl } = this.props;
    const { sender, recipient, rvalue, utxo } = this.state;
    if (!sender) {
      this.setState({
        senderError: intl.formatMessage({ id: 'input.error.incorrect.address' })
      });
      return false;
    }
    if (!recipient) {
      this.setState({
        recipientError: intl.formatMessage({
          id: 'input.error.incorrect.address'
        })
      });
      return false;
    }
    if (!rvalue) {
      // todo true validator
      this.setState({
        rvalueError: intl.formatMessage({ id: 'input.error.invalid.value' })
      });
      return false;
    }
    if (!utxo || utxo.length < 50) {
      // todo true validator
      this.setState({
        utxoError: intl.formatMessage({ id: 'input.error.invalid.value' })
      });
      return false;
    }
    return true;
  };

  onVerify = () => {
    const { sender, recipient, rvalue, utxo } = this.state;
    const { verify } = this.props;
    if (!this.validate()) {
      return;
    }
    verify(sender, recipient, rvalue, utxo)
      .then(resp => {
        const block = resp.epoch || '--';
        const amount = resp.amount / POWER_DIVISIBILITY;
        const date = resp.timestamp && new Date(resp.timestamp);
        this.setState({
          verified: true,
          amount,
          block,
          date,
          pdfData: {
            title: this.title,
            // subtitle: this.subtitle,// todo
            sender,
            recipient,
            rvalue,
            utxo,
            verificationDate: date,
            block,
            amount
          }
        });
        return resp;
      })
      .catch(e => {
        console.log(e);
        this.setState({
          verified: false,
          amount: null,
          block: null,
          date: null
        });
      });
  };

  get verificationResult() {
    const { intl } = this.props;
    const { verified } = this.state;
    if (verified)
      return intl.formatMessage({ id: 'certificate.verification.valid' });
    if (verified !== null)
      return intl.formatMessage({ id: 'certificate.verification.failed' });
    return '';
  }

  get title() {
    const { intl } = this.props;
    return intl.formatMessage({ id: 'certificate.title' });
  }

  get verificationDate() {
    const { intl } = this.props;
    const { date } = this.state;
    return date
      ? intl.formatDate(date, {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : '';
  }

  downloadAsPdf() {
    const { intl } = this.props;
    const { pdfData } = this.state;

    remote.dialog.showSaveDialog({}, filename => {
      if (!filename) return;
      const doc = generateCertificatePdf(intl, pdfData);

      doc.pipe(fs.createWriteStream(filename));
      doc.end();
    });
  }

  render() {
    const { visible, intl, waiting } = this.props;
    const {
      sender,
      senderError,
      recipient,
      recipientError,
      rvalue,
      rvalueError,
      utxo,
      utxoError,
      verified,
      amount,
      block
    } = this.state;
    return (
      <Modal
        options={{
          title: intl.formatMessage({ id: 'certificate.title' }),
          // subtitle: 'Generated on June, 5th, 2019 at 10:17am',// todo
          type: 'big',
          visible,
          onClose: this.close.bind(this)
        }}
        style={{ width: '55%' }}
      >
        <div className={styles.Container}>
          <span
            className={styles.LabelBold}
            style={{ margin: '40px 0 20px 0' }}
          >
            <FormattedMessage id="certificate.data.title" />
          </span>
          <div className={styles.Row}>
            <div className={`${styles.RowLabel} ${styles.LabelBold}`}>
              <FormattedMessage id="certificate.sender" />:
            </div>
            <Input
              value={sender}
              onChange={e =>
                this.setState({ sender: e.target.value, senderError: '' })
              }
              placeholder={`${intl.formatMessage({
                id: 'certificate.sender.address'
              })}...`}
              noLabel
              error={senderError}
              showError={!!senderError}
              autoFocus
              style={{ marginBottom: 0, flexGrow: 1 }}
            />
          </div>
          <div className={styles.Row}>
            <div className={`${styles.RowLabel} ${styles.LabelBold}`}>
              <FormattedMessage id="certificate.recipient" />:
            </div>
            <Input
              value={recipient}
              onChange={e =>
                this.setState({ recipient: e.target.value, recipientError: '' })
              }
              placeholder={`${intl.formatMessage({
                id: 'certificate.recipient.address'
              })}...`}
              noLabel
              error={recipientError}
              showError={!!recipientError}
              style={{ marginBottom: 0, flexGrow: 1 }}
            />
          </div>
          <div className={styles.Row}>
            <div className={`${styles.RowLabel} ${styles.LabelBold}`}>
              <FormattedMessage id="certificate.rvalue" />:
            </div>
            <Input
              value={rvalue}
              onChange={e =>
                this.setState({ rvalue: e.target.value, rvalueError: '' })
              }
              placeholder={`${intl.formatMessage({
                id: 'certificate.rvalue'
              })}...`}
              noLabel
              error={rvalueError}
              showError={!!rvalueError}
              style={{ marginBottom: 0, flexGrow: 1 }}
            />
          </div>
          <div className={styles.Row}>
            <div className={`${styles.RowLabel} ${styles.LabelBold}`}>
              <FormattedMessage id="certificate.utxo" />:
            </div>
            <Input
              value={utxo}
              onChange={e =>
                this.setState({ utxo: e.target.value, utxoError: '' })
              }
              placeholder={intl.formatMessage({ id: 'certificate.utxo' })}
              noLabel
              error={utxoError}
              showError={!!utxoError}
              style={{ marginBottom: 0, flexGrow: 1 }}
            />
          </div>
          <div
            className={styles.Row}
            style={{ marginTop: 20, marginBottom: 20 }}
          >
            <div
              className={`${styles.RowLabel} ${styles.LabelBold}`}
              style={{ width: 'auto' }}
            >
              <FormattedMessage id="certificate.verification.title" />
            </div>
            <span
              className={styles.LabelSmall}
              style={{ textAlign: 'right', marginLeft: 'auto' }}
            >
              {this.verificationDate}
            </span>
          </div>
          <div className={styles.VerificationContainer}>
            <div className={styles.VerificationRow}>
              <span className={styles.LabelBold}>
                <FormattedMessage id="certificate.sender" />:
              </span>
              <span
                className={verified ? styles.LabelSuccess : styles.LabelFailed}
              >
                {this.verificationResult}
              </span>
            </div>
            <div className={styles.VerificationRow}>
              <span className={styles.LabelBold}>
                <FormattedMessage id="certificate.recipient" />:
              </span>
              <span
                className={verified ? styles.LabelSuccess : styles.LabelFailed}
              >
                {this.verificationResult}
              </span>
            </div>
            <div className={styles.VerificationRow}>
              <span className={styles.LabelBold}>
                <FormattedMessage id="certificate.utxo" />:
              </span>
              <span
                className={verified ? styles.LabelSuccess : styles.LabelFailed}
              >
                {this.verificationResult}
              </span>
            </div>
            <div />
            <div />
            <div className={styles.VerificationRow}>
              <span className={styles.LabelBold}>
                <FormattedMessage id="certificate.block" />:
              </span>
              <span className={styles.LabelSmall}>{block}</span>
            </div>
          </div>
          <div className={styles.Row} style={{ marginTop: 20 }}>
            <div
              className={`${styles.RowLabel} ${styles.LabelBold}`}
              style={{ width: 'auto', textTransform: 'none' }}
            >
              <FormattedMessage id="certificate.amount" />
            </div>
            <span className={styles.LabelAmount} style={{ marginLeft: '20px' }}>
              {amount ? `${formatDigit(amount)} STG` : ''}
            </span>
          </div>
        </div>
        <div className={styles.ActionsContainer}>
          <Button
            type="OutlinePrimary"
            onClick={this.onVerify}
            submit
            priority={1}
          >
            <FormattedMessage id="button.verify" />
          </Button>
          {verified === true && (
            <Button type="OutlinePrimary" onClick={() => this.downloadAsPdf()}>
              Download as PDF
            </Button>
          )}
        </div>
        <Busy
          title={intl.formatMessage({
            id: 'certificate.verifications.waiting'
          })}
          visible={waiting}
        />
      </Modal>
    );
  }
}

export default connect(
  state => ({ waiting: state.app.waiting }),
  dispatch => ({
    verify: (...args) => dispatch(validateCertificate(...args))
  })
)(injectIntl(Verify));

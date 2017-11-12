import React from 'react';

class EditReceiptModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
    }
  }

  componentDidMount() {
    this.setState({ input: this.props.oneRowRec })
  }

  onChangeHandler = (e) => {
    e.preventDefault();
    this.setState({
      input: e.target.value,
    })
  }

  render() {
    return (
      <div>
        <div className="modal-label">
          <h4>Edit Your Entries</h4>
          <br />
          <input
            className="edit-input"
            value={this.state.input}
            onChange={(e) => this.onChangeHandler(e)}
          />
        </div>
        <div className="modal-btn">
          <button onClick={this.props.callEditReceiptModal} className="btn cancel-btn">Cancel</button>
          <button onClick={() => this.props.onEditRecSubmit(this.state.input, this.props.index)} className="btn del-btn">Submit</button>
        </div>
      </div>
    )
  }
}

export default EditReceiptModal;

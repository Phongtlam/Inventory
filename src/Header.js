import React from 'react';
import './style/Header.css';
import Categories from './Categories';

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayCat: false,
    }
  }

  onCategoriesClick = () => {
    let displayCat = !this.state.displayCat;
    this.setState({ displayCat });
  }

  render() {
    let catIcon = <a className="categories-icon">&#9776;</a>;
    if (this.state.displayCat === true) {
      catIcon = <a className="categories-icon">X </a>
    }
    return (
      <div className="header">
        {this.props.isVoice ? (
          <button onClick={this.props.endVoice} className="btn mic header-button"><i className="fa fa-microphone-slash" aria-hidden="true"></i></button>
        ) : (
          <button onClick={this.props.startVoice} className="btn mic header-button"><i className="fa fa-microphone" aria-hidden="true"></i></button>
        )}
        <button className="btn header-button file-container"><i className="fa fa-cloud-upload" aria-hidden="true"></i>
          Upload Receipt
          <input
            type="file"
            onChange={(e)=>this.props.imageChange(e)} />
        </button>
        <div>
          <button
            className="btn categories header-button"
            onClick={this.onCategoriesClick}
          >
            {catIcon} <span>Categories</span>
          </button>
          <Categories
            {...this.state}
            {...this.props}
          />
        </div>
        <button onClick={this.props.switchGraphs} className="btn header-button">
          {this.props.isBar ? (
            <i className="fa fa-bar-chart" aria-hidden="true"></i>
          ) : (
            <i className="fa fa-pie-chart" aria-hidden="true"></i>
          )}
          Graphs
        </button>
        <button className="btn header-button"><i className="fa fa-sign-in" aria-hidden="true"></i>
          Login
        </button>
      </div>
    )
  }
}

export default Header;

import React, { Component } from 'react';
import './style/App.css';
import axios from 'axios';
import annyang from 'annyang';
import Upload from './Upload';
import InfoRow from './InfoRow';
import Header from './Header';
import DelModal from './DelModal';
import EditModal from './EditModal';
import MergeModal from './MergeModal';
import PieGraph from './PieGraph';
import BarGraph from './BarGraph';
import EditReceiptModal from './EditReceiptModal';
import Spinner from './Spinner';

import fakeData from './fakeData';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: '',
      imageViewer: '',
      infoRow: [],
      categories: fakeData,
      isDel: false,
      isMerge: false,
      isDelModal: false,
      isEditModal: false,
      isMergeModal: false,
      isBar: false,
      isEditReceiptModal: false,
      isSpinner: false,
      isVoice: false,
    }
  }

  processImage = (e) => {
    e.preventDefault();
    const { imageViewer } = this.state;
    let myImage = imageViewer.slice(22, imageViewer.length);
    const googleV = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.REACT_APP_VISION}`;

    axios(googleV, {
      method: 'POST',
      mode: 'cors',
      data: {
        "requests": [
          {
            "image": {
              "content": myImage,
            },
            "features": [
              {
                "type": "DOCUMENT_TEXT_DETECTION"
              }
            ]
          }
        ]
      }
    })
    .then(response => {
      // this is the parse receipt
      let infoRow = (response) ? response.data.responses[0].textAnnotations[0].description.split('\n') : null;
      return infoRow;
    })
    .then(infoRow => {
      if (infoRow) {
        this.setState({ infoRow });
      } else {
        return;
      }
    })
  }

  toQuickBooks = () => {
    console.log('toQuickBooks', this.state.infoRow)
    axios("https://inventory-ba-backend.herokuapp.com/v1/application/processReceipt", {
      method: 'POST',
      mode: "cors",
      data: {
        "content": this.state.infoRow,
      }
    })
  }

  imageChange = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let image = e.target.files[0];
    if (!image) return;
    reader.readAsDataURL(image);

    reader.onloadend = () => {
      this.setState({
        image,
        imageViewer: reader.result,
        isSpinner: true,
      }, () => {
        this.processImage(e);
        setTimeout(() => {
          this.setState({ isSpinner: false });
        }, 1000);
      });
    };
  }

  addCategory = (item) => {
    this.setState(prevState => ({
      categories: prevState.categories.concat(item),
    }));
  }

  updateCat = (cat) => {
    this.setState({ categories: cat });
  }

  updateUtilsBtn = (isDel, isMerge) => {
    if (isDel === true) {
      this.setState({ isDel: true });
    } else if (isDel === false) {
      this.setState({ isDel: false });
    }
    if (isMerge === true) {
      this.setState({ isMerge: true });
    } else if (isMerge === false) {
      this.setState({ isMerge: false });
    }
  }

  callDelModal = () => {
    this.setState({ isDelModal: !this.state.isDelModal });
  }

  delModalYes = () => {
    const newCat = this.state.categories.filter((cat) => {
      return cat.x === false;
    });

    this.setState({
      categories: newCat,
      isDelModal: false,
      isDel: false,
    }, () => {
      let isCheckMark = false;
      let categories = this.state.categories;
      for (var i=0; i<categories.length; i++) {
        if (categories[i].checkMark) isCheckMark = true;
      }
      if (isCheckMark) {
        this.setState({ isMerge: true });
      } else {
        this.setState({ isMerge: false });
      }
    })
  }

  delModalNo = () => {
    this.setState({ isDelModal: false });
  }

  callMergeModal = () => {
    this.setState({ isMergeModal: !this.state.isMergeModal });
  }

  mergeModalYes = (newLabel) => {
    let newItem = {
      id: newLabel.toString(),
      x: false,
      checkMark: false,
      label: newLabel,
      items: [],
      total: 0,
    };
    let categories = this.state.categories;
    for (let i=0; i<categories.length; i++) {
      if (categories[i].checkMark === true) {
        newItem.items = newItem.items.concat(categories[i].items);
        newItem.total += categories[i].total;
      }
    }
    let newCat = this.state.categories.filter((cat) => {
      return cat.checkMark === false;
    });
    newCat.push(newItem);
    let isDel = false;
    for (let i=0; i<newCat.length; i++) {
      if (newCat[i].x === true) {
        isDel = true;
        break;
      }
    }
    if (isDel) {
      this.setState({ isDel: true });
    } else {
      this.setState({ isDel: false });
    }
    this.setState({
      categories: newCat,
      isMerge: false,
    });
  }

  editCatName = (cat) => {
    this.setState({ isEditModal: !this.state.isEditModal });
    this.cat = cat;
  }

  submitNewCatName = (cats) => {
    this.setState({ categories: cats });
  }

  switchGraphs = () => {
    this.setState({ isBar: !this.state.isBar });
  }

  callEditReceiptModal = (oneRowRec, i) => {
    this.setState({ isEditReceiptModal : !this.state.isEditReceiptModal });
    this.oneRowRec = oneRowRec;
    this.index = i;
  }

  onEditRecSubmit = (input, index) => {
    let newInfoRow = this.state.infoRow;
    newInfoRow[index] = input;
    this.setState({
      infoRow: newInfoRow,
      isEditReceiptModal: false,
    })
  }

  startVoice = () => {
    this.setState({ isVoice: true });
    const commands = {
      'change graph': this.switchGraphs,
      'turn off voice': this.endVoice,
      'change crap' : this.switchGraphs,
    };
    annyang.addCommands(commands);
    annyang.debug();
    annyang.start();
  }

  endVoice = () => {
    this.setState({ isVoice: false });
    if (annyang) annyang.abort();
  }

  render() {
    let barGraphClass = (this.state.isBar) ? "bar-graph-show" : "bar-graph-hide";
    let pieGraphClass = (!this.state.isBar) ? "pie-graph-show" : "pie-graph-hide";
    return (
      <div className="App">
        <span className="site-name"><strong>INVENTORY - BA</strong></span>
        <header className="App-header">
          <Header
            {...this.state}
            startVoice={this.startVoice}
            endVoice={this.endVoice}
            switchGraphs={this.switchGraphs}
            callMergeModal={this.callMergeModal}
            editCatName={this.editCatName}
            callDelModal={this.callDelModal}
            updateUtilsBtn={this.updateUtilsBtn}
            updateCat={this.updateCat}
            addCategory={this.addCategory}
            imageChange={this.imageChange}
          />
        </header>
        <div className="App-container">
          <div style={{ "paddingLeft": "103px" }}>
            <Upload {...this.state}
              processImage={this.processImage}
              imageChange={this.imageChange}
            />
          </div>
          <div>
            {this.state.isSpinner ? (
              <div style={{
                position: "relative",
                left: "-70px",
              }}>
                <Spinner />
              </div>
            ) : (
              <div>
                <button onClick={this.toQuickBooks} className="btn button-to-quickbooks">QuickBooks<i className="fa fa-paper-plane-o to-quickbooks" aria-hidden="true"></i></button>
                <div className="info-row">
                  <InfoRow
                    {...this.state}
                    callEditReceiptModal={this.callEditReceiptModal}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="graphs">
            <div className={pieGraphClass}>
              <PieGraph {...this.state} />
            </div>
            <div className={barGraphClass}>
              <BarGraph {...this.state} />
            </div>
          </div>
        </div>
        {this.state.isEditModal &&
          <div className="modal">
            <EditModal
              cat={this.cat}
              submitNewCatName={this.submitNewCatName}
              editCatName={this.editCatName}
              categories={this.state.categories}
            />
          </div>
        }
        {this.state.isDelModal &&
          <div className="modal">
            <DelModal delModalYes={this.delModalYes} delModalNo={this.delModalNo} />
          </div>
        }
        {this.state.isMergeModal &&
          <div className="modal">
            <MergeModal {...this.state} mergeModalYes={this.mergeModalYes} callMergeModal={this.callMergeModal} />
          </div>
        }
        {this.state.isEditReceiptModal &&
          <div className="modal">
            <EditReceiptModal
              {...this.state}
              oneRowRec={this.oneRowRec}
              callEditReceiptModal={this.callEditReceiptModal}
              index={this.index}
              onEditRecSubmit={this.onEditRecSubmit}
            />
          </div>
        }
      </div>
    );
  }
}

export default App;

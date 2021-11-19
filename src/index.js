import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { connect } from 'react-redux';
import { createStore } from 'redux';
import './index.css';

//redux
const RUN = 'RUN'
const PAUSE = 'PAUSE'
const RESET = 'RESET'
const INCREASE = 'INCREASE'
const DECREASE = 'DECREASE'

const runAction = {
  type: RUN
}

const pauseAction = {
  type: PAUSE
}

const resetAction = {
  type: RESET
}

const increaseAction = (value) => {
  return {
    type: INCREASE,
    value
  }
}

const decreaseAction = (value) => {
  return {
    type: DECREASE,
    value
  }
}
const timeReducer = (stage = {minutes: 25, seconds: 0, breakLength: 5,
                              sessionLength: 25, title: 'Session', running: false
                             }, action) => {
  const audio = document.getElementById('beep')
    
  switch (action.type) {
    case RUN:
      if (stage.minutes === 0 && stage.seconds === 0) {
        audio.play()
        if (stage.title === 'Session') {
          return {
            ...stage,
            minutes: stage.breakLength,
            seconds: 0,
            title: 'Break',
            running: false
          }          
        } else {
          return {
            ...stage,
            minutes: stage.sessionLength,
            seconds: 0,
            title: 'Session',
            running: false
          }
        }
      }

      if (stage.seconds === 0) {
        return {
          ...stage,
          minutes: stage.minutes - 1,
          seconds: 59,
          running: true
        }
      } else {
        return {
          ...stage,
          seconds: stage.seconds - 1
        }
      }
    case PAUSE:
      return {
        ...stage,
        running: false
      }
    case RESET:
      audio.pause()
      audio.currentTime = 0
      return {
        ...stage,
        minutes: 25,
        seconds: 0,
        breakLength: 5,
        sessionLength: 25,
        title: 'Session',
        running: false
      }
    case INCREASE: 
      if (!stage.running) {
        if (action.value === 'session') {
          return {
            ...stage,
            minutes: stage.sessionLength + 1 <= 60 ? stage.sessionLength + 1 : stage.sessionLength,
            seconds: 0,
            sessionLength: stage.sessionLength + 1 <= 60 ? stage.sessionLength + 1 : stage.sessionLength
          }
        }

        if (action.value === 'break') {
          return {
            ...stage,
            breakLength: stage.breakLength + 1 <= 60 ? stage.breakLength + 1 : stage.breakLength
          }
        }
      }
    case DECREASE: 
      if (!stage.running) {
        if (action.value === 'session') {
          return {
            ...stage,
            minutes: stage.sessionLength - 1 >= 1 ? stage.sessionLength - 1 : 1,
            seconds: 0,
            sessionLength: stage.sessionLength - 1 >= 1 ? stage.sessionLength - 1 : 1
          }
        }

        if (action.value === 'break') {
          return {
            ...stage,
            breakLength: stage.breakLength - 1 >= 1 ? stage.breakLength - 1 : 1
          }
        }
      }
    default: 
      return stage
  }
}

const store = createStore(timeReducer)

//react
class TimeBox extends React.Component {
  render() {
    console.log("re-render-time")
    return (
      <div className='time-box'>
        <h2 id='timer-label'>{this.props.title}</h2>
        <h1 id='time-left'>{(this.props.minutes < 10 ? ("0" + this.props.minutes) : this.props.minutes)
                            + ":" + (this.props.seconds < 10 ? ("0" + this.props.seconds) : this.props.seconds)}</h1>
        <audio 
            id='beep'
            hidden
            src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
            type='audio/wav' 
        />
      </div>
    )
  }
}

class ButtonBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      runningTime: null
    }

    this.clickStartStop = this.clickStartStop.bind(this)
    this.clickReset = this.clickReset.bind(this)
  }

  clickStartStop = (e) => {
    if (this.state.runningTime === null) {
      let interval = setInterval(() => {
        store.dispatch(runAction)
      }, 1000)

      this.setState({
        runningTime: interval
      })
    } else {
      clearInterval(this.state.runningTime)
      store.dispatch(pauseAction)
      this.setState({
        runningTime: null
      })
    }
  }

  clickReset = (e) => {
    clearInterval(this.state.runningTime)
    store.dispatch(resetAction)
    this.setState({
      runningTime: null
    })
  }

  render() {
    console.log("re-render-button")
    return (
      <div className='button-bar'>
        <button id='start_stop' onClick={this.clickStartStop}>
          <i className="fas fa-play fa-2x"></i>
          <i className="fas fa-pause fa-2x"></i>
        </button>
        <button id='reset' onClick={this.clickReset}>
          <i className="fas fa-undo-alt fa-2x"></i>
        </button>
      </div>
    )
  }
}

class Control extends React.Component {
  constructor(props) {
    super(props)

    this.clickIncrease = this.clickIncrease.bind(this)
    this.clickDecrease = this.clickDecrease.bind(this)
  }

  clickIncrease = (e) => {
    store.dispatch(increaseAction(e.target.className))
  }

  clickDecrease = (e) => {
    store.dispatch(decreaseAction(e.target.className))
  }

  render() {
    console.log("re-render-length")
    return (
      <div className='control'>
        <div className='length'>
          <h2 id='session-label'>Session Length</h2>
          <div className='content'>
            <button className='session' onClick={this.clickIncrease} id="session-increment">
              <i className="fas fa-arrow-up fa-2x"></i>
            </button>

            <h2 className='value-length' id='session-length'>{this.props.sessionLength}</h2>
            <button className='session' onClick={this.clickDecrease} id="session-decrement">
              <i className="fas fa-arrow-down fa-2x"></i>
            </button>
          </div>
        </div>
        <div className='length'>
          <h2 id='break-label'>Break Length</h2>
          <div className='content'>
            <button className='break' onClick={this.clickIncrease} id="break-increment">
              <i className="fas fa-arrow-up fa-2x"></i>
            </button>
            <h2 className='value-length' id='break-length'>{this.props.breakLength}</h2>
            <button className='break' onClick={this.clickDecrease} id="break-decrement">
              <i className="fas fa-arrow-down fa-2x"></i>
            </button>
          </div>
        </div>
      </div>
    )
  }
}

//react-redux
const mapStateToProps = (state) => {
  return state
}

const DisplayTime = connect(mapStateToProps, null)(TimeBox)
const DisplayControl = connect(mapStateToProps, null)(Control)

function App() {
  return (
    <div>
      <div className='title'>
        <h1>25 + 5 Clock</h1>
      </div>
      <Provider store={store}>
        <DisplayControl />
        <DisplayTime />
      </Provider>
      <ButtonBar />
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
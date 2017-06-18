import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import AppBar from 'material-ui/AppBar';
import LinkIcon from 'material-ui/svg-icons/content/link';
import transitions from 'material-ui/styles/transitions';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import ErrorIcon from 'material-ui/svg-icons/alert/warning';
import FullScreen from 'material-ui/svg-icons/navigation/fullscreen';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Slider from 'material-ui/Slider';
import { shell } from 'electron';

const styles = {
  element: {
    position: 'fixed',
    top: 0,
    width: '100%',
    boxSizing: 'border-box',
    zIndex: 10,
    transition: transitions.easeOut(null, 'background-color', null),
  },
  appBar: {
    boxShadow: 'none',
  },
  headlines: {
    transition: transitions.easeOut(null, 'padding-left', null),
    paddingRight: 20,
  },
  headline: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 'normal',
    margin: 0,
  },
  h1: {
    fontSize: '1.7em',
  },
  controls: {
    position: 'absolute',
    width: '100%',
    height: 10,
    right: 0,
    bottom: 62,
  },
  fab: {
    position: 'absolute',
    right: 40,
    bottom: -28,
  },
  slider: {
    position: 'absolute',
    width: 100,
    right: 180,
    bottom: 0,
  },
  innerSlider: {
    margin: 0,
  },
  videoDiv: {
    paddingTop: 40,
    marginLeft: -40,
  },
};

export default class MediaBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      error: false,
      volume: 1,
      audio: new Audio(),
      fullscreen: false,
    };
  }

  static propTypes = {
    station: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    broadcast: PropTypes.string,
    onLeftIconButtonTouchTap: PropTypes.func.isRequired,
    iconStyleLeft: PropTypes.object,
    style: PropTypes.object,
    height: PropTypes.number,
    docked: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    const vm = this;
    this.player = videojs(this.videoNode);
    this.player.on('fullscreenchange', function () {
      vm.toggleFullscreen();
    });
    this.player.play();
    this.setState({ playing: true });
    this.currentStation = this.props.station.streamurl;
  }

  updateVolume(volume) {
    this.setState({ volume });
    this.player.volume(volume);
  }

  componentDidUpdate() {
    if (this.currentStation !== this.props.station.streamurl) {
      this.currentStation = this.props.station.streamurl;
      this.player.src({
        src: this.props.station.streamurl,
        type: 'application/x-mpegURL',
      });
      this.player.play();
      this.setState({ playing: true });
    }
  }

  playPause() {
    if (this.state.playing) {
      this.player.pause();
    } else {
      this.player.play();
    }
    this.setState({ playing: !this.state.playing });
  }

  getPlayIcon() {
    if (this.state.error && this.state.playing) {
      return <ErrorIcon/>;
    }
    return this.state.playing ? <PauseIcon/> : <PlayIcon/>;
  }

  toggleFullscreen() {
    if (this.player.isFullscreen()) {
      this.setState({ fullscreen: true });
    } else {
      this.setState({ fullscreen: false });
    }
  }

  fullScreen() {
    this.setState({ fullscreen: true });
    this.player.requestFullscreen();
  }

  openWebsite() {
    shell.openExternal(this.props.station.website);
  }

  render() {
    const marginLeft = (this.state.fullscreen || !this.props.docked ? 0 : 120);
    const width = '100%';
    return <div style={{
      height: this.props.height,
      ...styles.element,
      backgroundColor: this.props.theme.palette.primary1Color,
      color: this.props.theme.palette.alternateTextColor,
    }}>
      <AppBar style={styles.appBar}
              onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap}
              iconStyleLeft={this.props.iconStyleLeft}
              iconElementRight={<IconButton tooltip="Open Station Website"
                                            tooltipPosition="bottom-left"
                                            onTouchTap={ () => this.openWebsite() }>
                <LinkIcon /></IconButton>}/>
      <div style={{ ...styles.headlines, ...this.props.style }}>
        <h1 style={{ ...styles.headline, ...styles.h1 }}>{this.props.station.name}</h1>
        <h2 style={styles.headline}>{this.props.broadcast}</h2>
        <div style={styles.controls}>
          <Slider style={styles.slider}
                  sliderStyle={styles.innerSlider}
                  value={this.state.volume}
                  onChange={(e, value) => this.updateVolume(value)}/>
          <div style={styles.fab}>
            <FloatingActionButton
              onTouchTap={() => this.playPause()}>
              {this.getPlayIcon()}
            </FloatingActionButton>
            <FloatingActionButton
              onTouchTap={() => this.fullScreen()}>
              <FullScreen/>
            </FloatingActionButton>
          </div>
        </div>
      </div>
      <div style={ styles.videoDiv }>
        <video ref={ node => (this.videoNode = node) } style={{ marginLeft, width }} className="video-js" width="640" height="480">
          <source
            src={this.props.station.streamurl}
            type={this.props.station.format}/>
        </video>
      </div>
    </div>;
  }
}

var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  render: function() {
    return (
      <div>
        <MusicPlayer />
        <DrumMachine />
      </div>
      )
  }
});

// MusicPlayer (Left)

var MusicPlayer = React.createClass({
  getInitialState: function(){
    return {
      songs: ['Adventure Awaits', 'Fantasy Boss', 'Fantasy Town', 'Respectfully Resigned'],
      chosen: null
    }
  },

  makeAudio: function(title, i){
    var mp3 = "audio/" + title + ".mp3";
    var wav = "audio/" + title + ".wav";
    return (
      <audio ref={title} key={i}>
        <source src={mp3} />
        <source src={wav} />
        <p> This browser does not support our audio format. </p>
      </audio>
      )
  },

  playPause: function(){
    if (this.state.chosen){
      var chosen_song = this.refs[this.state.chosen];
      if (chosen_song.paused) {
        chosen_song.play();
      }
      else {
        chosen_song.pause();
      }
    }
  },

  stop: function(){
    if (this.state.chosen) {
          var chosen_song = this.refs[this.state.chosen];
      if (!chosen_song.paused) {
        chosen_song.pause();
        chosen_song.currentTime = 0
      }
    }
  },

  select: function(title){
    this.stop();
    this.setState({chosen: title});
  },

  render: function(){
    var audioList = this.state.songs.map(this.makeAudio);

    return (
      <div>
        {audioList}
        <SongList titles={this.state.songs} chosen={this.state.chosen} select={this.select} playPause={this.playPause}/>
      </div>
    )
  }
});

var Control = React.createClass({
  getDefaultProps: function(){
    return {
      progress: 0
    }
  },

  propTypes: {
    playPause: React.PropTypes.func.isRequired
  },

  render: function(){
    return (
      <div>
        <img src="img/pause.png" height="42" width="42" onClick={this.props.playPause}></img>
      </div>
      )
  }
});

var SongList = React.createClass({
  getDefaultProps: function(){
    return {
      titles: [],
      chosen: ""
    }
  },

  propTypes: {
    select: React.PropTypes.func.isRequired
  },

  getSong: function(title, i){
    if (title === this.props.chosen) {
      return (<Song name={title} class_name="song chosen_song" select={this.props.select} key={i}/>)
    }
    return (<Song name={title} class_name="song" select={this.props.select} key={i}/>)
  },

  render: function(){
    var listItems = this.props.titles.map(this.getSong);
    return (
      <div className="songList">
        <div className="songHeader">
          <h3> SONG </h3>
          <Control playPause={this.props.playPause} />
        </div>
        {listItems}
      </div>
      )
  }
});

var Song = React.createClass({
  getDefaultProps: function(){
    return {
      name: "",
      class_name: "song"
    }
  },

  propTypes: {
    select: React.PropTypes.func.isRequired
  },

  selectThis: function() {
    this.props.select(this.props.name);
  },

  render: function(){
    return (
      <div onClick={this.selectThis} className={this.props.class_name} >
        <p>{this.props.name}</p>
      </div>

      )
  }
});

// DrumMachine (Right)

var DrumMachine = React.createClass({
  getInitialState: function(){
    return {
      effects: ['Hi-Hat', 'Snare', 'Bass'],
      numBeats: 16,
      currentBeat: 0,
      id: null,
      paused: true,
      tempo: 120
    }
  },

  makeAudio: function(){
    var audios = [];

    for (var i = 0; i < this.state.effects.length; i++) {
      for (var j = 0; j < this.state.numBeats; j++) {
        var title = this.state.effects[i];
        var mp3 = "audio/" + title + ".mp3";
        var effect = (
          <audio ref={title+j} key={title+j} muted>
            <source src={mp3} />
            <p> This browser does not support our audio format. </p>
          </audio>
        );
        effect.a

        audios.push(effect);
      }
    }

    return audios;
  },

  toggle: function(title){
    var effect = this.refs[title];
    effect.muted = !effect.muted;
  },

  beginBeat: function(){
    this.setState({paused: false});
    this.playBeat();
    this.setState({id: setInterval(this.playBeat, 60 / this.state.tempo / (this.state.numBeats / 4) * 1000)});
  },

  endBeat: function(){
    if (this.state.id) {
      clearInterval(this.state.id);
      this.setState({id: null});
      this.setState({paused: true});
    }
  },

  playBeat: function(){
    for (var i = 0; i < this.state.effects.length; i++) {
      var ref = this.state.effects[i] + this.state.currentBeat;
      var effect = this.refs[ref];
      effect.play();
    }
    this.setState({currentBeat: (this.state.currentBeat + 1) % this.state.numBeats});
  },

  playPauseBeat: function(){
    if (this.state.id) {
      this.endBeat();
      this.state.currentBeat = 0;
    }
    else {
      this.beginBeat();
    }
  },

  setTempo: function(new_tempo){
    this.setState({tempo: new_tempo});
  },

  render: function(){
    var effectsList = this.makeAudio();

    return (
      <div>
        {effectsList}
        <EffectList titles={this.state.effects} setTempo={this.setTempo}
        numBeats={this.state.numBeats} currentBeat={this.state.currentBeat} playEffect={this.playEffect} 
        toggle={this.toggle} playPauseBeat={this.playPauseBeat} paused={this.state.paused} />
      </div>
    )
  }
});

var EffectList = React.createClass({
  getDefaultProps: function(){
    return {
      titles: [],
      numBeats: 1,
      currentBeat: 0,
      paused: true
    }
  },

  getEffects: function(){
    var effects = [];
    for (var i = 0; i < this.props.titles.length; i++) {
      var effect_group = []
      var kind = this.props.titles[i];
      effect_group.push((<div className="drumName"> <p>{kind}</p> </div> ));
      for (var j = 0; j < this.props.numBeats; j++) {
        var title = kind + j;
        if (j % 4 == 3) {
          var effect = (<Effect name={title} key={title} toggle={this.props.toggle} endBeat={true}/>)
        }
        else {
          var effect = (<Effect name={title} key={title} toggle={this.props.toggle} endBeat={false}/>)
        }

        effect_group.push(effect);
      }
      effects.push((
        <div className="effectGroup">
          {effect_group}
        </div>))
      effects.push((<p> </p>));
    }
    return effects;
  },

  render: function(){
    var listItems = this.getEffects()
    return (
      <div className="effectList">
        <div className="effectHeader">
          <h3> CREATE YOUR OWN BEAT! </h3>
          <img src="img/pause.png" width="42" height="42" onMouseDown={this.props.playPauseBeat}></img>
        </div>
        {listItems}
        <Metronome paused={this.props.paused} currentBeat={this.props.currentBeat} numBeats={this.props.numBeats} />
        <TapTempo setTempo={this.props.setTempo} />
      </div>
      )
  }
});

var Effect = React.createClass({
  getInitialState: function(){
    return {
      on: false,
      endBeat: false
    }
  },

  getDefaultProps: function(){
    return {
      name: ""
    }
  },

  toggleThis: function() {
    var newOn = !this.state.on;
    this.setState({on: newOn});
    this.props.toggle(this.props.name);
  },

  render: function(){
    var class_name = "drumbox";
    if (this.state.on) {
      class_name = "drumbox on";
    }
    if (this.props.endBeat) {
      class_name += " endBeat";
    }
    return (
      <div ref={this.props.name} className={class_name} onClick={this.toggleThis}><p></p></div>
      )
  }
});

var Metronome = React.createClass({
  getDefaultProps: function() {
    return {
      currentBeat: 0,
      numBeats: 1,
      paused: true
    }
  },

  makeMetronome: function() {
    var metronomeBoxes = [];
    for (var i = 0; i < this.props.numBeats; i++) {
      var class_name = "metronomeBox";
      if (i === (this.props.currentBeat - 1) % this.props.numBeats && !this.props.paused) {
        class_name += " on";
      }
      if (i % 4 === 3) {
        class_name += " endBeat";
      }
      metronomeBoxes.push((
        <MetronomeBox class_name={class_name} />
        ));
    }
    return metronomeBoxes;
  },

  render: function() {
    return (
      <div className="metronomeGroup">
        {this.makeMetronome()}
      </div>
      )
  }
});

var MetronomeBox = React.createClass({
  getDefaultProps: function() {
    class_name: "metronomeBox"
  },
  render: function() {
    return (
      <div className={this.props.class_name} ><p></p></div>
      )
  }
});

var TapTempo = React.createClass({

  propTypes: {
    setTempo: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      numTaps: 0,
      sum_of_difference: 0,
      prevTime: null
    }
  },

  updateTempo: function() {
    this.refs["tapTempo"].value = "";
    var curTime = new Date().getTime();
    var num = this.state.numTaps;
    if (this.state.prevTime) {
      var diff = curTime - this.state.prevTime;
      var rest = 2;
      if (diff > rest * 1000) {
        num = 0;
        this.setState({
          numTaps: num + 1,
          prevTime: curTime,
          sum_of_difference: 0.0
        });
      }
      else {
        var avg = (this.state.sum_of_difference + diff) * 1.0 / (num);
        var tempo = 1000 * 60 / avg;
        this.props.setTempo(tempo);

        this.setState({
          sum_of_difference: this.state.sum_of_difference + diff,
          numTaps: num + 1,
          prevTime: curTime
        });

      }
    }
    else {
        this.setState({
          numTaps: num + 1,
          prevTime: curTime
      });
    }
  },

  render: function() {
    return (
      <div className="tapTempoContainer">
        <p className="tapTempoHeader">Tap Tempo </p>
        <input type="text" ref="tapTempo" className="tapTempo" onKeyDown={this.updateTempo}></input>
        <p className="instructions">Click Box & Tap Any Key In Beat (Reset: Wait 2 Seconds)</p>
      </div>
      )
  }
});


ReactDOM.render(<App />, document.getElementById("musicPlayer"));
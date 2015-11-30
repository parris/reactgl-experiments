import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as HomeActions from '../actions/HomeActions';

import {Scene, Cube, Camera} from './Scene';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }

  rotate(delta) {
    requestAnimationFrame(this.rotate.bind(this));
    this.setState({
      time: delta * 0.001
    });
  }

  componentDidMount() {
    requestAnimationFrame(this.rotate.bind(this));
  }

  render() {
    const {title, dispatch} = this.props;
    const actions = bindActionCreators(HomeActions, dispatch);
    return (
      <main className="l-full">
        <Scene Camera={Camera} width="70%" height="100%" rotation={this.state.time}>
          <Cube color={[0.0, 1.0, 0.0, 1.0]}/>
        </Scene>
      </main>
    );
  }
}

export default connect(state => state.Sample)(Home)

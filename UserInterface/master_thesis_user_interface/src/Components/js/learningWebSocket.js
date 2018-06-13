import React, { Component } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import $ from 'jquery';
import Plotly from 'plotly';

var stompClient = null;
class learningWebSocket extends Component {
    constructor(props){
        super(props);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.visualization = this.visualization.bind(this);
    }

    setConnected(connected) {
        $("#connect").prop("disabled", connected);
        $("#disconnect").prop("disabled", !connected);
    }

    connect(){
        var socket = new SockJS('http://localhost:8080/gs-guide-websocket');
        stompClient = Stomp.over(socket); // use different web socket other than browsers native websocket
        stompClient.connect({}, function (frame) {
            this.setConnected(true);
            console.log('Connected: ' + frame);
            // subscribe method returns id and unsubscribe method
            stompClient.subscribe('/topic/kafkaMessages', function (messageFromKafka) {
                console.log('messageFromKafka');
                this.storeMessages(JSON.parse(messageFromKafka.body).content);
            }.bind(this));
        }.bind(this)); 
    }

    disconnect(){
        console.log('disconnect');
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        this.setConnected(false);
        console.log("Disconnected"); 
    }

    visualization(event){
        event.preventDefault();
        // body of STOMP message must be String
        var stompBody = {topic: sessionStorage.getItem('topic_name'), bootstrap_servers: '127.0.0.1:9092'}
        stompClient.send("/app/checkContinuosData", {}, JSON.stringify(stompBody)); //parameters: destination, headers, body
    }

    storeMessages(message) {
        console.log('messageReceived')
        console.log(message);
        this.drawGraph()
    }

    drawGraph(){
        console.log('graph localization');
        let draw_places = $('#visualization_id');
        Plotly.plot(draw_places,[{
            type: 'bar',
            x: [1,2,3],
            y: [2,5,3]
        }],{margin: {t:0}});
    }

    render() {
        return (
            <div>
                <div className="form-group">
                    <label htmlFor="connect">WebSocket connection:</label>
                    <button id="connect" className="btn btn-default" type="submit" onClick={this.connect}>Connect</button>
                    <button id="disconnect" className="btn btn-default" type="submit" disabled="disabled" onClick={this.disconnect}>Disconnect
                    </button>
                </div>

                <form className="form-inline">
                    <button id="send" className="btn btn-default" type="submit" onClick={this.visualization}>Visualization</button>
                </form>

                <div id="visualization_id"></div>
            </div>

        );
    }
}

export default learningWebSocket;



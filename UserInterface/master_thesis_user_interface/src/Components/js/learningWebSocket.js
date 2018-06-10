import React, { Component } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import $ from 'jquery';

var stompClient = null;
class learningWebSocket extends Component {
    constructor(props){
        super(props);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.sendName = this.sendName.bind(this);
    }

    setConnected(connected) {
        $("#connect").prop("disabled", connected);
        $("#disconnect").prop("disabled", !connected);
        if (connected) {
            $("#conversation").show();
        }
        else {
            $("#conversation").hide();
        }
        $("#greetings").html("");
    }

    connect(){
        var socket = new SockJS('http://localhost:8080/gs-guide-websocket');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            this.setConnected(true);
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/greetings', function (greeting) {
                this.showGreeting(JSON.parse(greeting.body).content);
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

    sendName(event){
        event.preventDefault();
        stompClient.send("/app/hello", {}, JSON.stringify({'name': $("#name").val()}));
    }

    showGreeting(message) {
        $("#greetings").append("<tr><td>" + message + "</td></tr>");
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
                    <div className="form-group">
                        <label htmlFor="name">What is your name?</label>
                        <input type="text" id="name" className="form-control" placeholder="Your name here..." />
                    </div>
                    <button id="send" className="btn btn-default" type="submit" onClick={this.sendName}>Send</button>
                </form>

                <div className="col-md-12">
                    <table id="conversation" className="table table-striped">
                        <thead>
                        <tr>
                            <th>Greetings</th>
                        </tr>
                        </thead>
                        <tbody id="greetings">
                        </tbody>
                    </table>
                </div>
            </div>

        );
    }
}

export default learningWebSocket;



package com.example.websocketdemo.controller;

import com.example.websocketdemo.model.ServiceMessage;
import com.example.websocketdemo.model.ServiceMessage.MessageType;
import com.example.websocketdemo.model.ChatMessage;
import com.example.websocketdemo.model.DrawMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class DrawController {
	@MessageMapping("/draw.sendMessage")
    @SendTo("/topic/public")
    public ServiceMessage sendDrawMessage(@Payload DrawMessage drawMessage) {
    	ServiceMessage sm = new ServiceMessage();
    	sm.setType(ServiceMessage.MessageType.DRAW);
    	sm.setdraw(drawMessage);
        return sm;
    }


}

import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import { VOICE, VoiceParameter } from "./Voice"
import * as io from "socket.io-client";
import StringUtil from "./StringUtil";
import Logger from "./Logger";
import { Speaker } from "./Speaker"
const port = require("../../../config.json").port
const AA_TEMPLATE = "このメッセージはアスキーアートです。";
const LONG_TEXT_TEMPLATE = "長文のため省略";
const MODE = {
    AA: "aa",
    MESSAGE: "message"
}
export default class ProvideManager {
    speaking: boolean = false;
    socket = io.connect("http://localhost:" + port);
    speaker: Speaker;
    vParam: VoiceParameter = new VoiceParameter();
    constructor() {
    }

    provide(letter: string, body: string, reading: boolean = true) {
        let anchorReplace = StringUtil.anchorToReadable(body);
        let brReplace = StringUtil.replaceBr2NewLine(anchorReplace);
        const aa = () => {
            if (reading)
                this.speaker.speak(letter + "\n" + AA_TEMPLATE, this.vParam);
            this.socket.emit(MODE.AA, letter + "\r\n" + brReplace);
        }
        
        if (this.isAA(brReplace, 2)) {
            if (this.speaker.speaking()) {
                this.cancel(aa);
                Logger.log("cancel", "too long text.");
            } else {
                aa();
            }
            return;
        }
        let urlReplace = StringUtil.urlToReadable(brReplace);
        let ZENHANReplace = StringUtil.replaceHANKAKUtoZENKAKU(urlReplace);

        const messenger = () => {
            if (reading)
                this.speaker.speak(letter + "\n" + ZENHANReplace, this.vParam);
            this.socket.emit(MODE.MESSAGE, letter + "\r\n" + brReplace);
        }
        if (this.speaker.speaking()) {
            this.cancel(messenger);
            Logger.log("cancel", "too long text.");
        } else {
            messenger();
        }

    }

    test(letter: string, body: string, reading: boolean = true) {
        this.provide(letter, body, reading);
    }

    dummyText(body: string) {
        this.socket.emit(  MODE.AA , body);;
    }

    isAA(value: string, count?: number): boolean {
        return StringUtil.isAA(value, count);
    }

    selectVoice(value: number, path?: string) {
        Logger.log("select speaker", value.toString());
        if (value === VOICE.WSA) {
            this.speaker = new WebspeechApi();
        } else if (value === VOICE.SOFTALK) {
            this.speaker = new SofTalk(path);
        }
    }

    cancel(callback?: () => void) {
            this.speaker.cancel();
            setTimeout(() => {
                if (callback) callback();
            },1000);
    }
}
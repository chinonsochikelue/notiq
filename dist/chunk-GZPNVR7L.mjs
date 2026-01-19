import {
  __spreadProps,
  __spreadValues,
  init_react_shim
} from "./chunk-77KXU36M.mjs";

// src/components/editor/nodes/PollNode/index.tsx
init_react_shim();
import {
  DecoratorNode
} from "lexical";
import * as React from "react";
import { Suspense } from "react";
var PollComponent = React.lazy(
  () => import("./poll-component-2R4MDLHS.mjs")
);
function createUID() {
  return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 5);
}
function createPollOption(text = "") {
  return {
    text,
    uid: createUID(),
    votes: []
  };
}
function cloneOption(option, text, votes) {
  return {
    text,
    uid: option.uid,
    votes: votes || Array.from(option.votes)
  };
}
function $convertPollElement(domNode) {
  const question = domNode.getAttribute("data-lexical-poll-question");
  const options = domNode.getAttribute("data-lexical-poll-options");
  if (question !== null && options !== null) {
    const node = $createPollNode(question, JSON.parse(options));
    return { node };
  }
  return null;
}
var PollNode = class _PollNode extends DecoratorNode {
  static getType() {
    return "poll";
  }
  static clone(node) {
    return new _PollNode(node.__question, node.__options, node.__key);
  }
  static importJSON(serializedNode) {
    return $createPollNode(
      serializedNode.question,
      serializedNode.options
    ).updateFromJSON(serializedNode);
  }
  constructor(question, options, key) {
    super(key);
    this.__question = question;
    this.__options = options;
  }
  exportJSON() {
    return __spreadProps(__spreadValues({}, super.exportJSON()), {
      options: this.__options,
      question: this.__question
    });
  }
  setQuestion(newQuestion) {
    const self = this.getWritable();
    self.__question = newQuestion;
  }
  addOption(option) {
    const self = this.getWritable();
    const options = Array.from(self.__options);
    options.push(option);
    self.__options = options;
  }
  deleteOption(option) {
    const self = this.getWritable();
    const options = Array.from(self.__options);
    const index = options.indexOf(option);
    options.splice(index, 1);
    self.__options = options;
  }
  setOptionText(option, text) {
    const self = this.getWritable();
    const clonedOption = cloneOption(option, text);
    const options = Array.from(self.__options);
    const index = options.indexOf(option);
    options[index] = clonedOption;
    self.__options = options;
  }
  toggleVote(option, clientID) {
    const self = this.getWritable();
    const newOptions = self.__options.map((opt) => {
      if (opt.uid === option.uid) {
        const newVotes = opt.votes.includes(clientID) ? opt.votes.filter((id) => id !== clientID) : [...opt.votes, clientID];
        return __spreadProps(__spreadValues({}, opt), { votes: newVotes });
      }
      return __spreadValues({}, opt);
    });
    self.__options = newOptions;
    this.markDirty();
  }
  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-poll-question")) {
          return null;
        }
        return {
          conversion: $convertPollElement,
          priority: 2
        };
      }
    };
  }
  exportDOM() {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-poll-question", this.__question);
    element.setAttribute(
      "data-lexical-poll-options",
      JSON.stringify(this.__options)
    );
    return { element };
  }
  createDOM() {
    const elem = document.createElement("span");
    elem.style.display = "inline-block";
    return elem;
  }
  updateDOM() {
    return false;
  }
  decorate() {
    return /* @__PURE__ */ React.createElement(Suspense, { fallback: null }, /* @__PURE__ */ React.createElement(
      PollComponent,
      {
        question: this.__question,
        options: this.__options,
        nodeKey: this.__key
      }
    ));
  }
};
function $createPollNode(question, options) {
  return new PollNode(question, options);
}
function $isPollNode(node) {
  return node instanceof PollNode;
}

export {
  createPollOption,
  PollNode,
  $createPollNode,
  $isPollNode
};

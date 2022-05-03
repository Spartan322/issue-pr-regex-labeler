"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Configuration parameters
            const token = core.getInput('repo-token', { required: true });
            const titleRegexStr = core.getInput('title-regex', { required: false });
            const bodyRegexStr = core.getInput('body-regex', { required: false });
            const labelList = core.getMultilineInput('label-list', { required: true });
            const trueValue = ['true', 'True', 'TRUE'];
            const findIssueNumInRegex = trueValue.includes(core.getInput('find-issue-in-regex', { required: false }));
            const issue_number = getIssueNumber();
            const issue_title = getIssueTitle();
            const issue_body = getIssueBody();
            if (issue_number === undefined || issue_title == undefined || issue_body === undefined) {
                console.log('Could not get issue number, issue title, or issue body from context, exiting');
                return;
            }
            if (titleRegexStr == "" && bodyRegexStr == "") {
                console.log('Could not find title or body regex, exiting');
                return;
            }
            var titleRegex = null, bodyRegex = null;
            var titleRegexResult = null, bodyRegexResult = null;
            if (titleRegexStr != "")
                titleRegex = new RegExp(titleRegexStr);
            if (bodyRegexStr != "")
                bodyRegex = new RegExp(bodyRegexStr);
            // A client to load data from GitHub
            const client = new github.GitHub(token);
            const addLabel = [];
            const removeLabelItems = [];
            if (titleRegex) {
                titleRegexResult = titleRegex.exec(issue_title);
            }
            if (bodyRegex) {
                bodyRegexResult = bodyRegex.exec(issue_body);
                if (!titleRegexResult && !bodyRegexResult) {
                    console.log(`Issue #${issue_number} does not contain the title regex in the title or body regex in the body of the issue, exiting`);
                    return 0;
                }
            }
            if (findIssueNumInRegex) {
                titleRegexResult === null || titleRegexResult === void 0 ? void 0 : titleRegexResult.forEach(element => {
                    const possibleIssue = parseInt(element, 10);
                    if (isNaN(possibleIssue))
                        return;
                    console.log(`Adding labels ${labelList.toString()} to issue #${possibleIssue}`);
                    addLabels(client, possibleIssue, labelList);
                });
                bodyRegexResult === null || bodyRegexResult === void 0 ? void 0 : bodyRegexResult.forEach(element => {
                    const possibleIssue = parseInt(element, 10);
                    if (isNaN(possibleIssue))
                        return;
                    console.log(`Adding labels ${labelList.toString()} to issue #${possibleIssue}`);
                    addLabels(client, possibleIssue, labelList);
                });
                return;
            }
            if (titleRegexResult && titleRegexResult[1] || bodyRegexResult && bodyRegexResult[1]) {
                console.log(`Adding labels ${labelList.toString()} to issue #${issue_number}`);
                addLabels(client, issue_number, labelList);
            }
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
function getIssueTitle() {
    const issue = github.context.payload.issue;
    if (!issue) {
        const pull_request = github.context.payload.pull_request;
        if (!pull_request)
            return;
        return pull_request.title;
        return;
    }
    return issue.title;
}
function getIssueNumber() {
    const issue = github.context.payload.issue;
    if (!issue) {
        const pull_request = github.context.payload.pull_request;
        if (!pull_request)
            return;
        return pull_request.number;
        return;
    }
    return issue.number;
}
function getIssueBody() {
    const issue = github.context.payload.issue;
    if (!issue) {
        const pull_request = github.context.payload.pull_request;
        if (!pull_request)
            return;
        return pull_request.body;
        return;
    }
    return issue.body;
}
function addLabels(client, issue_number, labels) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.issues.addLabels({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: issue_number,
            labels: labels
        });
    });
}
run();

import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    // Configuration parameters
    const token = core.getInput('repo-token', { required: true });
    const titleRegexStr = core.getInput('title-regex', { required: false });
    const bodyRegexStr = core.getInput('body-regex', { required: false });
    const labelList = core.getMultilineInput('label-list', { required: true });
    const trueValue = ['true', 'True', 'TRUE'];
    const findIssueNumInRegex : boolean = trueValue.includes(core.getInput('find-issue-in-regex', { required: false }));
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

    var titleRegex : RegExp | null = null,
        bodyRegex : RegExp | null = null;
    var titleRegexResult: RegExpExecArray | null = null,
        bodyRegexResult: RegExpExecArray | null = null;
    if (titleRegexStr != "")
      titleRegex = new RegExp(titleRegexStr);
    if (bodyRegexStr != "")
      bodyRegex = new RegExp(bodyRegexStr);

    // A client to load data from GitHub
    const client = new github.GitHub(token);

    const addLabel: string[] = []
    const removeLabelItems: string[] = []

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

    if(findIssueNumInRegex)
    {
      titleRegexResult?.forEach(element => {
        const possibleIssue = parseInt(element, 10);
        if(isNaN(possibleIssue)) return;
        console.log(`Adding labels ${labelList.toString()} to issue #${possibleIssue}`)
        addLabels(client, possibleIssue, labelList);
      });

      bodyRegexResult?.forEach(element => {
        const possibleIssue = parseInt(element, 10);
        if(isNaN(possibleIssue)) return;
        console.log(`Adding labels ${labelList.toString()} to issue #${possibleIssue}`)
        addLabels(client, possibleIssue, labelList);
      });

      return;
    }

    if(titleRegexResult && titleRegexResult[1] || bodyRegexResult && bodyRegexResult[1]) {
      console.log(`Adding labels ${labelList.toString()} to issue #${issue_number}`)
      addLabels(client, issue_number, labelList);
    }
  } catch (error : any) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function getIssueTitle(): string | undefined {
  const issue = github.context.payload.issue;
  if (!issue) {
    const pull_request = github.context.payload.pull_request;
    if(!pull_request)
      return;
    return pull_request.title;
    return;
  }

  return issue.title;
}

function getIssueNumber(): number | undefined {
  const issue = github.context.payload.issue;
  if (!issue) {
    const pull_request = github.context.payload.pull_request;
    if(!pull_request)
      return;
    return pull_request.number;
    return;
  }

  return issue.number;
}

function getIssueBody(): string | undefined {
  const issue = github.context.payload.issue;
  if (!issue) {
    const pull_request = github.context.payload.pull_request;
    if(!pull_request)
      return;
    return pull_request.body;
    return;
  }

  return issue.body;
}

async function addLabels(
  client: github.GitHub,
  issue_number: number,
  labels: string[]
) {

  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issue_number,
    labels: labels
  });
}

run();

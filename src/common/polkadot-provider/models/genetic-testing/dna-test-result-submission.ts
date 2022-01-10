export class DnaTestResultSubmission {
    constructor(anyJson: any) {
      this.comments = anyJson.comments;
      this.result_link = anyJson.resultLink;
      this.report_link = anyJson.reportLink;
    }
    comments: string;
    result_link: string;
    report_link: string;
}
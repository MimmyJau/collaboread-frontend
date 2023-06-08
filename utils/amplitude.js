import * as amplitude from "@amplitude/analytics-browser";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

function ampInit() {
  amplitude.init(AMPLITUDE_API_KEY, undefined, {
    defaultTracking: {
      sessions: true,
      pageViews: true,
      formInteractions: true,
      fileDownloads: true,
    },
  });
}

function ampTrack(eventName) {
  console.log(eventName);
  amplitude.track(eventName);
}

export { ampInit, ampTrack };

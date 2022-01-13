import {
  generateSuspectSpansResponse,
  initializeData as _initializeData,
} from 'sentry-test/performance/initializePerformanceData';
import {act, mountWithTheme, screen, within} from 'sentry-test/reactTestingLibrary';

import ProjectsStore from 'sentry/stores/projectsStore';
import SpanDetails from 'sentry/views/performance/transactionSummary/transactionSpans/spanDetails';

function initializeData(settings) {
  const data = _initializeData(settings);
  act(() => void ProjectsStore.loadInitialData(data.organization.projects));
  return data;
}

describe('Performance > Transaction Spans > Span Details', function () {
  beforeEach(function () {
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/projects/',
      body: [],
    });

    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/eventsv2/',
      body: {data: [{count: 1}]},
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
    ProjectsStore.reset();
  });

  describe('Without Span Data', function () {
    beforeEach(function () {
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-spans-performance/',
        body: [],
      });

      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-spans/',
        body: [],
      });

      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-spans-stats/',
        body: {
          'percentileArray(spans_exclusive_time, 0.75)': {
            data: [
              [0, [{count: 0}]],
              [10, [{count: 0}]],
            ],
            order: 2,
            start: 0,
            end: 10,
          },
          'percentileArray(spans_exclusive_time, 0.95)': {
            data: [
              [0, [{count: 0}]],
              [10, [{count: 0}]],
            ],
            order: 2,
            start: 0,
            end: 10,
          },
          'percentileArray(spans_exclusive_time, 0.99)': {
            data: [
              [0, [{count: 0}]],
              [10, [{count: 0}]],
            ],
            order: 2,
            start: 0,
            end: 10,
          },
        },
      });
    });

    it('renders empty when missing project param', async function () {
      const data = initializeData({query: {transaction: 'transaction'}});

      const {container} = mountWithTheme(
        <SpanDetails params={{spanSlug: 'op:aaaaaaaa'}} {...data} />,
        {context: data.routerContext, organization: data.organization}
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('renders empty when missing transaction param', async function () {
      const data = initializeData({query: {project: '1'}});

      const {container} = mountWithTheme(
        <SpanDetails params={{spanSlug: 'op:aaaaaaaa'}} {...data} />,
        {context: data.routerContext, organization: data.organization}
      );

      expect(container).toBeEmptyDOMElement();
    });

    it('renders no data when empty response', async function () {
      const data = initializeData({
        features: ['performance-view', 'performance-suspect-spans-view'],
        query: {project: '1', transaction: 'transaction'},
      });

      mountWithTheme(<SpanDetails params={{spanSlug: 'op:aaaaaaaa'}} {...data} />, {
        context: data.routerContext,
        organization: data.organization,
      });

      expect(
        await screen.findByText('No results found for your query')
      ).toBeInTheDocument();

      expect(await screen.findByText('Exclusive Time Breakdown')).toBeInTheDocument();
    });
  });

  describe('With Span Data', function () {
    beforeEach(function () {
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-spans-performance/',
        body: generateSuspectSpansResponse(),
      });

      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-spans/',
        body: generateSuspectSpansResponse({examplesOnly: true}),
      });

      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-spans-stats/',
        body: {
          'percentileArray(spans_exclusive_time, 0.75)': {
            data: [
              [0, [{count: 0}]],
              [10, [{count: 0}]],
            ],
            order: 2,
            start: 0,
            end: 10,
          },
          'percentileArray(spans_exclusive_time, 0.95)': {
            data: [
              [0, [{count: 0}]],
              [10, [{count: 0}]],
            ],
            order: 2,
            start: 0,
            end: 10,
          },
          'percentileArray(spans_exclusive_time, 0.99)': {
            data: [
              [0, [{count: 0}]],
              [10, [{count: 0}]],
            ],
            order: 2,
            start: 0,
            end: 10,
          },
        },
      });
    });

    it('renders header elements', async function () {
      const data = initializeData({
        features: ['performance-view', 'performance-suspect-spans-view'],
        query: {project: '1', transaction: 'transaction'},
      });

      mountWithTheme(<SpanDetails params={{spanSlug: 'op:aaaaaaaa'}} {...data} />, {
        context: data.routerContext,
        organization: data.organization,
      });

      const operationNameHeader = await screen.findByTestId('header-operation-name');
      expect(
        await within(operationNameHeader).findByText('Span Operation')
      ).toBeInTheDocument();
      // TODO: add an expect for the span description here
      expect(
        await within(operationNameHeader).findByTestId('operation-name')
      ).toHaveTextContent('op');

      const percentilesHeader = await screen.findByTestId('header-percentiles');
      expect(
        await within(percentilesHeader).findByText('Exclusive Time Percentiles')
      ).toBeInTheDocument();
      const p75Section = await within(percentilesHeader).findByTestId('section-p75');
      expect(await within(p75Section).findByText('2.00ms')).toBeInTheDocument();
      expect(await within(p75Section).findByText('p75')).toBeInTheDocument();
      const p95Section = await within(percentilesHeader).findByTestId('section-p95');
      expect(await within(p95Section).findByText('3.00ms')).toBeInTheDocument();
      expect(await within(p95Section).findByText('p95')).toBeInTheDocument();
      const p99Section = await within(percentilesHeader).findByTestId('section-p99');
      expect(await within(p99Section).findByText('4.00ms')).toBeInTheDocument();
      expect(await within(p99Section).findByText('p99')).toBeInTheDocument();

      const frequencyHeader = await screen.findByTestId('header-frequency');
      expect(await within(frequencyHeader).findByText('100%')).toBeInTheDocument();
      expect(
        await within(frequencyHeader).findByText((_content, element) =>
          Boolean(
            element &&
              element.tagName === 'DIV' &&
              element.textContent === '1.00 times per event'
          )
        )
      ).toBeInTheDocument();

      const totalExclusiveTimeHeader = await screen.findByTestId(
        'header-total-exclusive-time'
      );
      expect(
        await within(totalExclusiveTimeHeader).findByText('5.00ms')
      ).toBeInTheDocument();
      expect(
        await within(totalExclusiveTimeHeader).findByText((_content, element) =>
          Boolean(
            element && element.tagName === 'DIV' && element.textContent === '1 events'
          )
        )
      ).toBeInTheDocument();
    });

    it('renders chart', async function () {
      const data = initializeData({
        features: ['performance-view', 'performance-suspect-spans-view'],
        query: {project: '1', transaction: 'transaction'},
      });

      mountWithTheme(<SpanDetails params={{spanSlug: 'op:aaaaaaaa'}} {...data} />, {
        context: data.routerContext,
        organization: data.organization,
      });

      expect(await screen.findByText('Exclusive Time Breakdown')).toBeInTheDocument();
    });

    it('renders table headers', async function () {
      const data = initializeData({
        features: ['performance-view', 'performance-suspect-spans-view'],
        query: {project: '1', transaction: 'transaction'},
      });

      mountWithTheme(<SpanDetails params={{spanSlug: 'op:aaaaaaaa'}} {...data} />, {
        context: data.routerContext,
        organization: data.organization,
      });

      expect(await screen.findByText('Event ID')).toBeInTheDocument();
      expect(await screen.findByText('Timestamp')).toBeInTheDocument();
      expect(await screen.findByText('Span Duration')).toBeInTheDocument();
      expect(await screen.findByText('Count')).toBeInTheDocument();
      expect(await screen.findByText('Cumulative Duration')).toBeInTheDocument();
    });
  });
});
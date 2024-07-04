import { newSpecPage } from '@stencil/core/testing';
import { CircularSlider } from '../circular-slider';
import { MockElement } from '@stencil/core/mock-doc';

// BELOW: Disable error (warning) for MockElement proxy on attachInternals, we handle it gracefully in the code.
//          We also validate that the form internals still work using the e2e test (as the error warning describes).
// Save the original attachInternals method
const originalAttachInternals = MockElement.prototype.attachInternals;

// Override the attachInternals method for MockElement
MockElement.prototype.attachInternals = function () {
  const internals = originalAttachInternals.call(this);

  return new Proxy(internals, {
    get(target, prop) {
      if (prop === 'setFormValue') {
        return () => {}; // No-op function
      }
      return target[prop];
    },
  });
};

describe('circular-slider', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CircularSlider],
      html: `<circular-slider></circular-slider>`,
    });
    expect(page.root).toEqualHtml(`
      <circular-slider role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow="0">
        <mock:shadow-root>
          <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
            <circle class="background" cx="150" cy="150" r="140" style="stroke: #ccc; stroke-width: 10px;"></circle>
            <circle class="foreground" cx="150" cy="150" r="140" style="stroke: #007bff; stroke-dasharray: 879.645943005142; stroke-dashoffset: 879.645943005142; stroke-width: 10px;"></circle>
            <circle class="thumb" cx="150" cy="10" r="10" style="fill: #007bff;"></circle>
            <text x="150" y="150" style="fill: #000; font-size: 24px;">0°</text>
          </svg>
        </mock:shadow-root>
      </circular-slider>
    `);
  });

  it('updates angle when value is changed', async () => {
    const page = await newSpecPage({
      components: [CircularSlider],
      html: `<circular-slider value="0"></circular-slider>`,
    });

    const element = page.root as HTMLCircularSliderElement;
    element.value = 90;
    await page.waitForChanges();

    const thumb = page.root.shadowRoot.querySelector('.thumb') as SVGCircleElement;
    const cx = thumb.getAttribute('cx');
    const cy = thumb.getAttribute('cy');

    // Ensure the thumb position has changed
    expect(cx).not.toBe('150');
    expect(cy).not.toBe('10');
  });

  it('applies custom colors', async () => {
    const page = await newSpecPage({
      components: [CircularSlider],
      html: `<circular-slider bg-color="#ff0000" fg-color="#00ff00" text-color="#0000ff"></circular-slider>`,
    });

    const backgroundCircle = page.root.shadowRoot.querySelector('.background') as SVGCircleElement;
    const foregroundCircle = page.root.shadowRoot.querySelector('.foreground') as SVGCircleElement;
    const text = page.root.shadowRoot.querySelector('text') as SVGTextElement;

    expect(backgroundCircle.style.stroke).toBe('#ff0000');
    expect(foregroundCircle.style.stroke).toBe('#00ff00');
    expect(text.style.fill).toBe('#0000ff');
  });

  it('formats text content using custom function', async () => {
    const page = await newSpecPage({
      components: [CircularSlider],
      html: `<circular-slider></circular-slider>`,
    });

    const element = page.root as HTMLCircularSliderElement;
    element.formatText = (value: number) => `${Math.floor(value / 15)}:00`;
    element.value = 90;
    await page.waitForChanges();

    const text = page.root.shadowRoot.querySelector('text') as SVGTextElement;
    expect(text.textContent).toBe('6:00');
  });

  it('handles key events to change value', async () => {
    const page = await newSpecPage({
      components: [CircularSlider],
      html: `<circular-slider value="0" min="0" max="360"></circular-slider>`,
    });

    const circularSlider = page.root as HTMLCircularSliderElement;

    // Simulate ArrowRight key press to increment value
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    circularSlider.dispatchEvent(eventRight);
    await page.waitForChanges();
    expect(circularSlider.value).toBe(1);

    // Simulate ArrowUp key press to increment value
    const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    circularSlider.dispatchEvent(eventUp);
    await page.waitForChanges();
    expect(circularSlider.value).toBe(2);

    // Simulate ArrowLeft key press to decrement value
    const eventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    circularSlider.dispatchEvent(eventLeft);
    await page.waitForChanges();
    expect(circularSlider.value).toBe(1);

    // Simulate ArrowDown key press to decrement value
    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    circularSlider.dispatchEvent(eventDown);
    await page.waitForChanges();
    expect(circularSlider.value).toBe(0);
  });

  it('dispatches input and change events', async () => {
    const page = await newSpecPage({
      components: [CircularSlider],
      html: `<circular-slider value="0" min="0" max="360" tabindex="1"></circular-slider>`,
    });

    const circularSlider = page.root as HTMLCircularSliderElement;
    const inputHandler = jest.fn();
    const changeHandler = jest.fn();

    circularSlider.addEventListener('input', inputHandler);
    circularSlider.addEventListener('change', changeHandler);

    // Simulate ArrowRight key press to increment value
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    circularSlider.dispatchEvent(eventRight);
    await page.waitForChanges();
    expect(inputHandler).toHaveBeenCalled();

    // Simulate mouseup to trigger change event
    const eventMouseUp = new MouseEvent('mouseup');
    document.dispatchEvent(eventMouseUp);
    await page.waitForChanges();
    expect(changeHandler).toHaveBeenCalled();
  });
});

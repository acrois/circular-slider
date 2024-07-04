import { newSpecPage } from '@stencil/core/testing';
import { CircularSlider } from '../circular-slider';

describe('circular-slider', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CircularSlider],
      html: `<circular-slider></circular-slider>`,
    });
    expect(page.root).toEqualHtml(`
      <circular-slider role="slider" aria-valuemin="0" aria-valuemax="360" aria-valuenow="0" tabindex="0">
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
});

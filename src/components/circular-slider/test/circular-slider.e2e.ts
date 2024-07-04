import { newE2EPage } from '@stencil/core/testing';

describe('circular-slider', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<circular-slider></circular-slider>');

    const element = await page.find('circular-slider');
    expect(element).toHaveClass('hydrated');
  });

  it('changes value when thumb is moved', async () => {
    const page = await newE2EPage();
    await page.setContent('<circular-slider value="0"></circular-slider>');

    const element = await page.find('circular-slider');

    const boundingBox = await page.evaluate(() => {
      const thumb = document.querySelector('circular-slider').shadowRoot.querySelector('.thumb');
      const rect = thumb.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };
    });

    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 50, centerY); // simulate drag
    await page.mouse.up();

    const value = await element.getProperty('value');
    expect(value).not.toBe('0');
  });

  it('submits value as part of a form', async () => {
    const page = await newE2EPage();
    await page.setContent('<form id="test-form"><circular-slider name="time" value="90"></circular-slider></form>');

    // await page.evaluate(() => {
    //   const form = document.getElementById('test-form') as HTMLFormElement;
    //   const input = document.createElement('input');
    //   input.type = 'submit';
    //   form.appendChild(input);
    // });
    const formDataBefore = await page.evaluate(() => {
      const form = document.getElementById('test-form') as HTMLFormElement;
      const formData: any = new FormData(form); // cast to any because entries doesn't exist on FormData in the node types
      return Array.from(formData.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    });

    expect(formDataBefore['time']).toBe('90');

    const circularSlider = await page.find('circular-slider');
    circularSlider.setProperty('value', 180);
    await page.waitForChanges();

    const formData = await page.evaluate(() => {
      const form = document.getElementById('test-form') as HTMLFormElement;
      const formData: any = new FormData(form); // cast to any because entries doesn't exist on FormData in the node types
      return Array.from(formData.entries()).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
    });

    expect(formData['time']).toBe('180');
  });
});

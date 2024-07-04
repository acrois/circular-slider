import { Component, Prop, State, Element, h, Host, Watch, AttachInternals } from '@stencil/core';
import { polarToCartesian, cartesianToPolar } from '../../utils/utils';

@Component({
  tag: 'circular-slider',
  styleUrl: 'circular-slider.css',
  shadow: true,
  formAssociated: true,
})
export class CircularSlider {
  @Element() element: HTMLElement;
  @AttachInternals() internals: ElementInternals;

  @Prop() size: number = 300;
  @Prop() bgColor: string = '#ccc';
  @Prop() fgColor: string = '#007bff';
  @Prop() thumbColor: string = '#007bff';
  @Prop() textColor: string = '#000';
  @Prop() thumbSize: number = 20;
  @Prop() fontSize: number = 24;
  @Prop() min: number = 0;
  @Prop() max: number = 360;
  @Prop({ mutable: true }) value: number = 0;
  @Prop() formatText: (value: number) => string = (value) => `${value}°`;

  @State() dragging: boolean = false;

  private svg: SVGSVGElement;
  private thumb: SVGCircleElement;
  private foreground: SVGCircleElement;

  componentDidLoad() {
    this.updateThumbPosition(this.value);

    if (this.internals && typeof this.internals.setFormValue === 'function') {
      try {
        this.internals.setFormValue(this.value.toString());
      } catch (e) {
        // Handle potential error in test environment
      }
    }

    this.attachEvents();
  }

  disconnectedCallback() {
    this.detachEvents();
  }

  @Watch('value')
  valueChanged(newValue: number) {
    this.updateThumbPosition(newValue);

    if (this.internals && typeof this.internals.setFormValue === 'function') {
      try {
        this.internals.setFormValue(newValue.toString());
      } catch (e) {
        // Handle potential error in test environment
      }
    }
  }

  private get radius() {
    return (this.size - this.thumbSize) / 2;
  }

  private get circumference() {
    return 2 * Math.PI * this.radius;
  }

  private updateThumbPosition(angle: number) {
    const { x, y } = polarToCartesian(this.size / 2, this.size / 2, this.radius, angle);
    this.thumb.setAttribute('cx', x.toString());
    this.thumb.setAttribute('cy', y.toString());
    this.foreground.style.strokeDashoffset = (this.circumference - (this.circumference * angle / 360)).toString();
    this.value = Math.round(angle);
  }

  private startDrag = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    this.dragging = true;
    this.updatePosition(e);
  };

  private stopDrag = (e: MouseEvent | TouchEvent) => {
    if (this.dragging) e.preventDefault();
    this.dragging = false;
  };

  private updatePosition = (e: MouseEvent | TouchEvent) => {
    if (!this.dragging) return;
    const rect = this.svg.getBoundingClientRect();
    const size = rect.width;
    const x = (e instanceof MouseEvent ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = (e instanceof MouseEvent ? e.clientY : e.touches[0].clientY) - rect.top;
    const angle = cartesianToPolar(size / 2, size / 2, x, y);
    this.updateThumbPosition(angle);
  };

  private handleKey = (e: KeyboardEvent) => {
    let newValue;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newValue = Math.min(this.value + 1, this.max);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newValue = Math.max(this.value - 1, this.min);
    }
    if (newValue !== undefined) {
      e.preventDefault();
      const angle = (newValue / this.max) * 360;
      this.updateThumbPosition(angle);
    }
  };

  private preventDrag = (e: TouchEvent) => {
    e.preventDefault();
  };

  private attachEvents() {
    this.svg.addEventListener('mousedown', this.startDrag);
    this.svg.addEventListener('touchstart', this.startDrag, { passive: true });
    document.addEventListener('mousemove', this.updatePosition);
    document.addEventListener('touchmove', this.updatePosition, { passive: true });
    document.addEventListener('mouseup', this.stopDrag);
    document.addEventListener('touchend', this.stopDrag);
    this.svg.addEventListener('touchstart', this.preventDrag, { passive: false });
    this.svg.addEventListener('touchmove', this.preventDrag, { passive: false });
    this.element.addEventListener('keydown', this.handleKey);
  }

  private detachEvents() {
    this.svg.removeEventListener('mousedown', this.startDrag);
    this.svg.removeEventListener('touchstart', this.startDrag);
    document.removeEventListener('mousemove', this.updatePosition);
    document.removeEventListener('touchmove', this.updatePosition);
    document.removeEventListener('mouseup', this.stopDrag);
    document.removeEventListener('touchend', this.stopDrag);
    this.svg.removeEventListener('touchstart', this.preventDrag);
    this.svg.removeEventListener('touchmove', this.preventDrag);
    this.element.removeEventListener('keydown', this.handleKey);
  }

  render() {
    const radius = this.radius;
    const circumference = this.circumference;

    return (
      <Host role="slider" aria-valuemin={this.min} aria-valuemax={this.max} aria-valuenow={this.value} tabindex="0">
        <svg ref={el => this.svg = el as SVGSVGElement} viewBox={`0 0 ${this.size} ${this.size}`} preserveAspectRatio="xMidYMid meet">
          <circle class="background" cx={this.size / 2} cy={this.size / 2} r={radius} style={{ stroke: this.bgColor, strokeWidth: `${this.thumbSize / 2}px` }}></circle>
          <circle class="foreground" ref={el => this.foreground = el as SVGCircleElement} cx={this.size / 2} cy={this.size / 2} r={radius} style={{ stroke: this.fgColor, strokeDasharray: `${circumference}`, strokeDashoffset: `${circumference}`, strokeWidth: `${this.thumbSize / 2}px` }}></circle>
          <circle class="thumb" ref={el => this.thumb = el as SVGCircleElement} cx={this.size / 2} cy={this.size / 2 - radius} r={this.thumbSize / 2} style={{ fill: this.thumbColor }}></circle>
          <text x={this.size / 2} y={this.size / 2} style={{ fill: this.textColor, fontSize: `${this.fontSize}px` }}>{this.formatText(this.value)}</text>
        </svg>
      </Host>
    );
  }
}

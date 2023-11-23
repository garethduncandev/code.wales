import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  public readonly codeBlockHeight = 10;
  public readonly codeBlockMinWidth = this.codeBlockHeight;
  public readonly padding = this.codeBlockHeight / 4;

  public readonly rectStyles = [
    {
      borderRadius: 1,
      color: 'rgb(0, 105, 243)',
      width: this.codeBlockMinWidth,
    },
    {
      borderRadius: 1,
      color: 'rgb(197, 134, 160)',
      width: this.codeBlockMinWidth,
    },
    {
      borderRadius: 1,
      color: 'rgb(79, 193, 255)',
      width: this.codeBlockMinWidth * 2,
    },
    {
      borderRadius: 1,
      color: 'rgb(156, 220, 254)',
      width: this.codeBlockMinWidth * 2,
    },
    {
      borderRadius: 1,
      color: 'rgb(0, 89, 206)',
      width: this.codeBlockMinWidth * 2,
    },
    {
      borderRadius: 1,
      color: 'rgb(220, 220, 138)',
      width: this.codeBlockMinWidth * 4,
    },
    {
      borderRadius: 1,
      color: 'rgb(189, 87, 129)',
      width: this.codeBlockMinWidth * 3,
    },
    {
      borderRadius: 1,
      color: 'rgb(77, 201, 176)',
      width: this.codeBlockMinWidth * 3,
    },

    {
      borderRadius: 1,
      color: 'rgb(0, 122, 216)',
      width: this.codeBlockMinWidth * 3,
    },
    {
      borderRadius: 1,
      color: 'rgb(106, 153, 81)',
      width: this.codeBlockMinWidth * 4,
    },
  ];
}

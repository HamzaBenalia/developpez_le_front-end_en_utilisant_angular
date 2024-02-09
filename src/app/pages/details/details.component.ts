import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { switchMap } from 'rxjs/operators';
import { Chart } from 'chart.js';
import { Subscription, of } from 'rxjs';
import { Router } from '@angular/router';
import { Country, Participation } from 'src/app/core/models/Country';
import { Header } from 'src/app/core/models/Header';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

  country: Country | undefined;
  private chart!: Chart;
  private subscription!: Subscription;
  public countryName: string = '';
  public entries: number = 0;
  public medals: number = 0;
  public athletes: number = 0;
  public error!: string;
  public header: Header = {
    title: this.countryName,
    indicators: [
      {
        label: "Number of entries",
        value: this.entries
      },
      {
        label: "Total Number of medals",
        value: this.medals
      },
      {
        label: "Total Number of athletes",
        value: this.athletes
      },
    ]
  }
  public lineChart!: Chart<"line", string[], number>;
  constructor(private route: ActivatedRoute, private router: Router, private olympicService: OlympicService) { }
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    let countryId: string | null = null;
    this.route.paramMap.subscribe((param: ParamMap) => countryId = param.get('id'));
    this.subscription = this.olympicService.getOlympics().subscribe((data) => {
      const numericCountryId = Number(countryId);
  
      // Filtrer les détails du pays spécifique par ID
      this.country = data.find((c: { id: number }) => c.id === numericCountryId);
      if(this.country){
        this.countryName = this.country?.country ?? null
            this.header.title = this.countryName

            const participations = this.country?.participations.map((i: Participation) => i)
            this.entries = participations?.length ?? 0;
            this.header.indicators[0].value = this.entries;
            const years = this.country?.participations.map((i: Participation) => i.year) ?? [];
            const medals = this.country?.participations.map((i: Participation) => i.medalsCount.toString()) ?? [];
            this.medals = medals.reduce((accumulator, item) => accumulator + parseInt(item), 0);
            this.header.indicators[1].value = this.medals;
            const athletes = this.country?.participations.map((i: Participation) => i.athleteCount.toString()) ?? [];
            this.athletes = athletes.reduce((accumulator, item) => accumulator + parseInt(item),0);
            this.createChart(years, medals);
      }else {
        console.error('Invalid countryId. Redirecting or displaying an error message might be appropriate.');
        this.router.navigate(['/not-found']);
      }
    });
  }

  createChart(years: number[], medals: string[]): void {
    console.log('Creating chart. Country details:', this.country);

    const lineChart = new Chart("myChart", {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: "medals",
            data: medals,
            backgroundColor: '#0b868f'
          },
        ]
      },
      options: {
        aspectRatio: 2.5
      }
    });
    this.lineChart = lineChart;
  }
}

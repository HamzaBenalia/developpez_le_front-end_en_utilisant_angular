import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import Chart from 'chart.js/auto';
import { Country} from 'src/app/core/models/Country';
import { Router } from '@angular/router';
import { Header } from 'src/app/core/models/Header';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  //public olympics$: Observable<any> = of(null);
  public chart!: Chart<"pie", number[], string>;  
  private numberOfJOs : number = 0;
  private numberOfCountries : number = 0;
  private subscription!: Subscription;
  header: Header = {
    title: 'Medal per Country',
    indicators: [
        { label: 'Number of JOs', value: this.numberOfJOs },
        { label: 'Number of Countries', value: this.numberOfCountries},
    ]
};


  constructor(private olympicService: OlympicService, private router : Router) {
    
  }
  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

  navigateToDetails(CountryId: number): void {
    if (this.router) {
      this.router.navigate(['./details', CountryId]);
    } else {
      console.error('Router is undefined.');
    }
  }
  

  ngOnInit(): void {
    // Chargez les données olympiques si elles ne sont pas encore chargées
    this.subscription = this.olympicService.getOlympics().subscribe((loadedData: Country[]) => {
      this.handleOlympicsData(loadedData);
    },
    (error) => {
      console.error('Error loading Olympics data:', error);
    });
  }
  
  private handleOlympicsData(data: Country[]): void {
    // Vérifiez si les données sont définies et non vides
    if (data && data.length > 0) {
      this.createChart(data); // appeler ou initialiser le graphique avec les données récupérées
  
      // Mise à jour des valeurs de numberOfJOs et numberOfCountries
      this.numberOfJOs = data.reduce((total, country) => total + country.participations.length, 0);
      this.numberOfCountries = data.length;
  
      // Mise à jour des valeurs dans headingInfo
      this.header.indicators[0].value = this.numberOfJOs;
      this.header.indicators[1].value = this.numberOfCountries;
    } else {
      console.error('Error: Olympics data is undefined or empty.');
    }
  }
  
  

  createChart(data: Country[]) {
    // Vérifiez si data est défini avant de tenter d'accéder à ses propriétés
    if (data && data.length > 0) {
      const labels = data.map(country => country.country);
      const ids = data.map(country => country.id);
      const datasets = data.map(country => country.participations.reduce((totalMedals, participation) => totalMedals + participation.medalsCount, 0));
      const colors = ['red', 'pink', 'green', 'yellow', 'orange', 'blue'];
  
      this.chart = new Chart("MyChart", {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Medal won',
            data: datasets,
            backgroundColor: colors,
            hoverOffset: 4
          }],
        },
        options: {
          aspectRatio: 2.5,
          onClick: (e) => {
            if (e.native) {
              const points = this.chart.getElementsAtEventForMode(e.native, 'point', { intersect: true }, true)
              if (points.length) {
                const firstPoint = points[0];
                const label = this.chart.data.labels ? this.chart.data.labels[firstPoint.index] : ''
                const id = ids ? ids[firstPoint.index] : ''
                const value = this.chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index]
                this.router.navigate(['details', id])
              }
            }
          }
        }
      });
    } else {
      console.error('Error: Olympics data is undefined or empty.');
    }
  }
  
}

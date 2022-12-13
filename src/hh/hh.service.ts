import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  HH_API_URL,
  SALARY_CLUSTER_ID,
  SALARY_CLUSTER_NOT_FOUND_ERROR,
} from './hh.constants';
import { HhResponse } from './hh.models';
import { lastValueFrom } from 'rxjs';
import { HhData } from 'src/top-page/top-page.model';

@Injectable()
export class HhService {
  private token: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.token = this.configService.get('HH_TOKEN') || '';
  }

  async getData(text: string) {
    try {
      const res$ = this.httpService.get<HhResponse>(HH_API_URL.vacancies, {
        params: {
          text,
          clusters: true,
        },
        headers: {
          'User-Agent': 'OwlTop',
          Authorization: `Bearer ${this.token}`,
        },
      });

      const { data } = await lastValueFrom(res$);

      return this.parseData(data);
    } catch (error) {
      Logger.error(error);
    }
  }

  private parseData(data: HhResponse): HhData {
    const salaryCluster = data.clusters.find(
      (cluster) => cluster.id === SALARY_CLUSTER_ID,
    );
    if (!salaryCluster) throw new Error(SALARY_CLUSTER_NOT_FOUND_ERROR);

    const juniorSalary = this.getSalaryFromString(salaryCluster.items[1].name);
    const middleSalary = this.getSalaryFromString(
      salaryCluster.items[Math.ceil(salaryCluster.items.length / 2)].name,
    );
    const seniorSalary = this.getSalaryFromString(
      salaryCluster.items[salaryCluster.items.length - 1].name,
    );

    return {
      count: data.found,
      juniorSalary,
      middleSalary,
      seniorSalary,
      updatedAt: new Date(),
    };
  }

  private getSalaryFromString(salary: string): number {
    const numberRegExp = /(\d+)/g;
    const result = salary.match(numberRegExp);
    if (!result) return 0;
    return Number(result[0]);
  }
}

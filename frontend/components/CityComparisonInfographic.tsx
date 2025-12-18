"use client";

import React from "react";
import { 
  ActiveListingsIcon, 
  TotalSalesIcon, 
  BenchmarkPriceIcon, 
  ChangeIcon, 
  PropertyTypeIcon,
  ComparisonBadge 
} from "./MetricIcons";

interface CityData {
  name: string;
  overall?: PropertyData;
  detached?: PropertyData;
  'single family detached'?: PropertyData;
  townhouse?: PropertyData;
  condo?: PropertyData;
  apartment?: PropertyData;
}

interface PropertyData {
  newListings?: number;
  activeListings?: number;
  totalSales?: number;
  benchmarkPrice?: number;
  momChange?: number;
  yoyChange?: number;
}

interface ComparisonResult {
  month: string;
  year: string;
  cities: CityData[];
  summary: string;
}

interface InfographicProps {
  data: ComparisonResult;
}

export default function CityComparisonInfographic({ data }: InfographicProps) {
  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899'];

  const formatPrice = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString();
  };

  const formatChange = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="max-w-full mx-auto bg-white rounded-lg border border-gray-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Greater Vancouver Market Comparison</h2>
            <p className="text-blue-100 text-sm mt-1">{data.month} {data.year}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Official Report</p>
            <p className="text-blue-100">Real Estate Board</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                City / Type
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Active Listings
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Total Sales
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                Benchmark Price
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                MoM Change (%)
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                YoY Change (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {data.cities.map((city, cityIdx) => {
              const overall = city.overall || {} as PropertyData;
              const detached = city.detached || city['single family detached'] || {} as PropertyData;
              const townhouse = city.townhouse || {} as PropertyData;
              const apartment = city.condo || city.apartment || {} as PropertyData;

              const propertyTypes = [
                { label: 'Overall', data: overall, isMain: true },
                { label: 'Detached', data: detached, isMain: false },
                { label: 'Townhouse', data: townhouse, isMain: false },
                { label: 'Apartment', data: apartment, isMain: false }
              ];

              return (
                <React.Fragment key={city.name}>
                  {propertyTypes.map((prop, propIdx) => (
                    <tr 
                      key={`${city.name}-${prop.label}`}
                      className={`${cityIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                        prop.isMain ? 'border-t-2 border-gray-400' : ''
                      } border-b border-gray-200 hover:bg-blue-50 transition-colors`}
                    >
                      {/* City/Property Name */}
                      <td className="px-4 py-2 border-r border-gray-300">
                        {prop.isMain ? (
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{city.name}</div>
                            <div className="text-xs text-gray-500">{prop.label}</div>
                          </div>
                        ) : (
                          <div className="pl-4 text-xs text-gray-700">{prop.label}</div>
                        )}
                      </td>

                      {/* Active Listings */}
                      <td className="px-3 py-2 text-center border-r border-gray-300">
                        <span className={`${prop.isMain ? 'font-bold' : 'font-medium'} text-sm text-gray-900`}>
                          {formatNumber(prop.data?.activeListings)}
                        </span>
                      </td>

                      {/* Total Sales */}
                      <td className="px-3 py-2 text-center border-r border-gray-300">
                        <span className={`${prop.isMain ? 'font-bold' : 'font-medium'} text-sm text-gray-900`}>
                          {formatNumber(prop.data?.totalSales)}
                        </span>
                      </td>

                      {/* Benchmark Price */}
                      <td className="px-3 py-2 text-center border-r border-gray-300">
                        <span className={`${prop.isMain ? 'font-bold' : 'font-semibold'} text-sm text-gray-900`}>
                          {formatPrice(prop.data?.benchmarkPrice)}
                        </span>
                      </td>

                      {/* MoM Change */}
                      <td className="px-3 py-2 text-center border-r border-gray-200">
                        <span className={`${prop.isMain ? 'font-bold' : 'font-semibold'} text-xs ${
                          (prop.data?.momChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatChange(prop.data?.momChange)}
                        </span>
                      </td>

                      {/* YoY Change */}
                      <td className="px-3 py-2 text-center">
                        <span className={`${prop.isMain ? 'font-bold' : 'font-semibold'} text-xs ${
                          (prop.data?.yoyChange ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatChange(prop.data?.yoyChange)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-300">
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Market Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
        <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
          <p>Source: Greater Vancouver Real Estate Board • Generated: {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}

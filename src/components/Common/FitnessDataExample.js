/**
 * Example component showing how to use connected apps data
 * This is a reference implementation - customize as needed
 */

import { useState, useEffect } from "react";
import useConnectedAppsStore from "../../store/useConnectedAppsStore";
import {
  fetchGoogleFitSteps,
  fetchGoogleFitHeartRate,
  getLastNDaysRange,
} from "../../utils/connectedAppsData";

const FitnessDataExample = () => {
  const [fitnessData, setFitnessData] = useState({
    steps: null,
    heartRate: null,
    loading: false,
    error: null,
  });

  const connectedApps = useConnectedAppsStore((state) => state.connectedApps);
  const isGoogleFitConnected = connectedApps?.google_fit?.isConnected;

  useEffect(() => {
    if (isGoogleFitConnected) {
      fetchData();
    }
  }, [isGoogleFitConnected]);

  const fetchData = async () => {
    setFitnessData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { startTime, endTime } = getLastNDaysRange(7);

      // Fetch data in parallel
      const [stepsData, heartRateData] = await Promise.all([
        fetchGoogleFitSteps(startTime, endTime),
        fetchGoogleFitHeartRate(startTime, endTime),
      ]);

      setFitnessData({
        steps: stepsData,
        heartRate: heartRateData,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch fitness data:", error);
      setFitnessData({
        steps: null,
        heartRate: null,
        loading: false,
        error: error.message,
      });
    }
  };

  if (!isGoogleFitConnected) {
    return (
      <div className="p-4 border border-[#E6E6E6] dark:border-[#414141] rounded-xl">
        <p className="text-sm text-[#838383] dark:text-[#C8C8C8]">
          Connect Google Fit to see your fitness data here
        </p>
      </div>
    );
  }

  if (fitnessData.loading) {
    return (
      <div className="p-4 border border-[#E6E6E6] dark:border-[#414141] rounded-xl">
        <p className="text-sm">Loading fitness data...</p>
      </div>
    );
  }

  if (fitnessData.error) {
    return (
      <div className="p-4 border border-[#E02E2A] rounded-xl bg-[#FEF2F2] dark:bg-[#2F1F1F]">
        <p className="text-sm text-[#E02E2A]">
          Error: {fitnessData.error}
        </p>
        <button
          onClick={fetchData}
          className="mt-2 text-sm underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border border-[#E6E6E6] dark:border-[#414141] rounded-xl">
        <h3 className="font-semibold mb-2">Steps (Last 7 Days)</h3>
        {fitnessData.steps?.bucket?.map((bucket, index) => {
          const steps = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
          const date = new Date(parseInt(bucket.startTimeMillis));
          
          return (
            <div key={index} className="flex justify-between text-sm mb-1">
              <span className="text-[#838383] dark:text-[#C8C8C8]">
                {date.toLocaleDateString()}
              </span>
              <span className="font-medium">{steps.toLocaleString()} steps</span>
            </div>
          );
        })}
      </div>

      <div className="p-4 border border-[#E6E6E6] dark:border-[#414141] rounded-xl">
        <h3 className="font-semibold mb-2">Heart Rate (Last 7 Days)</h3>
        {fitnessData.heartRate?.bucket?.map((bucket, index) => {
          const avgBpm = bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal;
          const date = new Date(parseInt(bucket.startTimeMillis));
          
          if (!avgBpm) return null;
          
          return (
            <div key={index} className="flex justify-between text-sm mb-1">
              <span className="text-[#838383] dark:text-[#C8C8C8]">
                {date.toLocaleDateString()}
              </span>
              <span className="font-medium">{Math.round(avgBpm)} bpm</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={fetchData}
        className="w-full px-4 py-2 rounded-lg border border-[#E6E6E6] dark:border-[#414141] hover:bg-[#F5F5F5] dark:hover:bg-[#3A3A3A] transition-colors text-sm"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default FitnessDataExample;

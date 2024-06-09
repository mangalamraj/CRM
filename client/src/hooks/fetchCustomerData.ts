"use client";

import { useEffect, useState } from "react";
import { useNotificationCenter } from "react-toastify/addons/use-notification-center";

type CustomerDetails = {
  custName: string;
  custEmail: string;
  spends: number;
  visits: number;
  lastVisits: string;
};

type FetchDataResponse = {
  data: CustomerDetails[] | null;
  error: string | null;
  loading: boolean;
};

const useFetchCustomerData = (): FetchDataResponse => {
  const [data, setData] = useState<CustomerDetails[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/getAllCustomerData",
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData: CustomerDetails[] = await response.json();
        setData(responseData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, error, loading };
};

export default useFetchCustomerData;

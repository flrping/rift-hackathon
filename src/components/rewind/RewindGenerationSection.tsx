"use client";

import { useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import type { MatchOverview } from "~/types/riot";

interface RewindGenerationSectionProps {
  handleGenerationOk: () => void;
  matches: { month: string; performances: MatchOverview[] }[];
  puuid: string;
  platform: string;
  queueType: string;
}

const RewindGenerationSection = ({
  handleGenerationOk,
  matches,
  puuid,
  platform,
  queueType,
}: RewindGenerationSectionProps) => {
  const sendQuery = api.aws.sendQuery.useMutation();
  const createRewind = api.rewind.createRewind.useMutation();
  const hasSentQuery = useRef(false);
  const hasCreatedRewind = useRef(false);

  useEffect(() => {
    if (matches.length && !hasSentQuery.current && !sendQuery.isPending) {
      hasSentQuery.current = true;
      sendQuery.mutate(matches);
    }
  }, [matches, sendQuery]);

  useEffect(() => {
    if (
      sendQuery.data &&
      !hasCreatedRewind.current &&
      !createRewind.isPending
    ) {
      hasCreatedRewind.current = true;
      createRewind.mutate({
        puuid,
        platform,
        queueType,
        year: new Date().getFullYear(),
        data: sendQuery.data,
      });
    }
  }, [sendQuery.data, createRewind, puuid, platform, queueType]);

  useEffect(() => {
    if (createRewind.data) {
      handleGenerationOk();
    }
  }, [createRewind.data, handleGenerationOk]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold">
          {sendQuery.isPending && "Analyzing your gameplay..."}
          {createRewind.isPending && "Saving your rewind..."}
          {createRewind.isSuccess && "Rewind generated!"}
        </h2>
        {sendQuery.isError && (
          <p className="text-red-500">Error generating rewind</p>
        )}
        {createRewind.isError && (
          <p className="text-red-500">Error saving rewind</p>
        )}
      </div>
    </div>
  );
};

export default RewindGenerationSection;

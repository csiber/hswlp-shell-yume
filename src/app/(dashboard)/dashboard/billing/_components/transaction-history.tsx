"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransactions } from "@/actions/credits.action";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTransactionStore } from "@/state/transaction";

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  PURCHASE: "Purchase",
  USAGE: "Usage",
  MONTHLY_REFRESH: "Monthly refresh",
  UPLOAD_REWARD: "Upload reward",
  SIGN_UP_BONUS: "Sign up bonus",
};

const UPLOAD_REWARD_ITEM_LABELS: Record<string, string> = {
  image: "image",
  music: "music",
  prompt: "prompt",
  video: "video",
};

const enDateFormat: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", enDateFormat);
}

function localizeTransactionType(type: string) {
  return TRANSACTION_TYPE_LABELS[type] ?? type.toLowerCase().replace("_", " ");
}

function localizeDescription(description: string) {
  const uploadRewardRegex = /^Upload reward \((.+)\)$/i;
  const match = description.match(uploadRewardRegex);
  if (match) {
    const item = match[1].toLowerCase();
    const itemHu = UPLOAD_REWARD_ITEM_LABELS[item] ?? item;
    return `Upload reward (${itemHu})`;
  }
  return description;
}

type TransactionData = Awaited<ReturnType<typeof getTransactions>>

function isTransactionExpired(transaction: TransactionData["transactions"][number]): boolean {
  return transaction.expirationDate ? isPast(new Date(transaction.expirationDate)) : false;
}

export function TransactionHistory() {
  const [data, setData] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const refreshTrigger = useTransactionStore((state) => state.refreshTrigger);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const result = await getTransactions({ page });
        setData(result);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page, refreshTrigger]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Boolean(data?.transactions.length && data?.transactions.length > 0) ? data?.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDate(new Date(transaction.createdAt))}
                    </TableCell>
                    <TableCell className="capitalize">
                      {localizeTransactionType(transaction.type)}
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "USAGE"
                          ? "text-red-500"
                          : isTransactionExpired(transaction)
                            ? "text-orange-500"
                            : "text-green-500"
                      }
                    >
                      {transaction.type === "USAGE" ? "-" : "+"}
                      {Math.abs(transaction.amount)} points
                    </TableCell>
                    <TableCell>
                      {localizeDescription(transaction.description)}
                      {transaction.type !== "USAGE" && transaction.expirationDate && (
                        <Badge
                          variant="secondary"
                          className={`mt-1 ml-3 font-normal text-[0.75rem] leading-[1rem] ${isTransactionExpired(transaction)
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-muted"
                            }`}
                        >
                          {isTransactionExpired(transaction) ? "Expired: " : "Expires: "}
                          {formatDate(new Date(transaction.expirationDate))}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No transactions</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {Boolean(data?.transactions.length && data?.transactions.length > 0) ? data?.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col space-y-2 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDate(new Date(transaction.createdAt))}
                </span>
                <span className="capitalize text-sm">
                  {localizeTransactionType(transaction.type)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {localizeDescription(transaction.description)}
                </span>
                <span
                  className={
                    transaction.type === "USAGE"
                      ? "text-red-500"
                      : isTransactionExpired(transaction)
                        ? "text-orange-500"
                        : "text-green-500"
                  }
                >
                  {transaction.type === "USAGE" ? "-" : "+"}
                  {Math.abs(transaction.amount)} points
                </span>
              </div>
              {transaction.type !== "USAGE" && transaction.expirationDate && (
                <Badge
                  variant="secondary"
                  className={`self-start font-normal text-[0.75rem] leading-[1rem] ${isTransactionExpired(transaction)
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-muted"
                    }`}
                >
                  {isTransactionExpired(transaction) ? "Expired: " : "Expires: "}
                  {formatDate(new Date(transaction.expirationDate))}
                </Badge>
              )}
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              No transactions
            </div>
          )}
        </div>

        {Boolean(data?.pagination.pages && data.pagination.pages > 1) && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} / {data?.pagination.pages ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data?.pagination.pages ?? 1, p + 1))}
              disabled={page === (data?.pagination.pages ?? 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

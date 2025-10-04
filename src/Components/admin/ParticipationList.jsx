import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { TabsContent } from "@/Components/ui/tabs";
import { Users, Eye, ArrowRight } from "lucide-react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { PaginationControls } from "@/utils/PaginationControls"
export const ParticipationList = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // eventId from route
  const api = useAxiosAuth();
  const navigate = useNavigate();
  const [page,setPage]=useState(1);
  const [totalPages,setTotalPages]=useState(1);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/event/${id}/participation-list/?page=${page}&page_size=10`);
        console.log('participants', res.data);
        setParticipants(res.data.results);
        setTotalPages(res.data.total_pages);
      } catch (error) {
        console.error("Error fetching participation list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id, api,page]);

  const exportParticipation = async (id) => {
    try {
      const res = await api.get(`/api/event/${id}/response-export/`, {
        responseType: "blob", // important
      });

      // Create a download URL
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      // You can dynamically name the file if backend sends filename in headers
      const contentDisposition = res.headers["content-disposition"];
      let fileName = "participation.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) fileName = match[1];
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up URL
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <TabsContent value="participants">

      <Card className=" pb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-[16px] font-semibold">Participants</h2>
            </div>
            <Button
              
              className="flex items-center gap-2 bg-blue/90 text:white hover:text-white hover:bg-blue/70 "
              onClick={() => navigate(exportParticipation(id))}
            >
             Export Participation detail  <ArrowRight className="w-4 h-4 transform transition-transform duration-200 hover:scale-x-110" />

            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="max-h-[500px] overflow-auto">
            <table className="min-w-full divide-y-2 divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="*:font-medium *:text-gray-900 text-[14px]">
                  <th className="px-3 py-2 whitespace-nowrap text-left">#</th>
                  <th className="px-3 py-2 whitespace-nowrap text-left">Participant Name</th>
                  <th className="px-3 py-2 whitespace-nowrap text-center">View details</th>
                </tr>
              </thead>


              <tbody className="divide-y divide-gray-200">
                {participants.length > 0 ? (
                  participants.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 text-[13px] text-left">{(idx + 1)+(page-1)*10}</td>
                      <td className="px-3 py-2 text-[13px] text-left">{p.participant_name}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          className="p-1 rounded hover:bg-blue/20 text-blue-600"
                          title="View"
                          // onClick={() => console.log("View participant", p)}
                          onClick={() => navigate(`/admin/participant-review/${p.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No participants found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </ScrollArea>
        </CardContent>
           <PaginationControls 
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
      </Card>
       
    </TabsContent>
  );
};






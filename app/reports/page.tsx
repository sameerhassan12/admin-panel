'use client';

import { useEffect, useState } from 'react';
import { getReports, resolveReport, Report } from '@/lib/firebase/reports';
import { getProductById, updateProductStatus, Product } from '@/lib/firebase/products';
import { Trash2, X, Check, Eye, ChevronDown, ChevronUp, Edit } from 'lucide-react';

interface ReportWithProduct extends Report {
  product?: Product | null;
  loadingProduct?: boolean;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      const filtered = filter === 'all' 
        ? data 
        : data.filter(r => r.status === filter);
      setReports(filtered.map(r => ({ ...r, product: null, loadingProduct: false })));
    } catch (error: any) {
      console.error('Error loading reports:', error);
      alert(error?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadProductDetails = async (reportId: string, productId: string) => {
    const reportIndex = reports.findIndex(r => r.id === reportId);
    if (reportIndex === -1) return;

    // If already expanded and product loaded, collapse
    if (expandedReports.has(reportId) && reports[reportIndex].product !== null) {
      setExpandedReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
      return;
    }

    // Expand and load product
    setExpandedReports(prev => new Set(prev).add(reportId));
    
    if (reports[reportIndex].product === null && !reports[reportIndex].loadingProduct) {
      setReports(prev => {
        const updated = [...prev];
        updated[reportIndex] = { ...updated[reportIndex], loadingProduct: true };
        return updated;
      });

      try {
        const product = await getProductById(productId);
        setReports(prev => {
          const updated = [...prev];
          updated[reportIndex] = { ...updated[reportIndex], product, loadingProduct: false };
          return updated;
        });
      } catch (error: any) {
        console.error('Error loading product:', error);
        setReports(prev => {
          const updated = [...prev];
          updated[reportIndex] = { ...updated[reportIndex], product: null, loadingProduct: false };
          return updated;
        });
      }
    }
  };

  const handleResolve = async (reportId: string, action: 'delete' | 'dismiss') => {
    const message = action === 'delete' 
      ? 'Are you sure you want to delete the reported product?'
      : 'Are you sure you want to dismiss this report?';
    
    if (!confirm(message)) return;

    try {
      await resolveReport(reportId, action);
      await loadReports();
      alert(`Report ${action === 'delete' ? 'resolved' : 'dismissed'} successfully!`);
    } catch (error: any) {
      alert(error?.message || 'Failed to resolve report');
    }
  };

  const handleStatusChange = async (productId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'sold') => {
    if (!confirm(`Are you sure you want to change product status to ${newStatus}?`)) return;

    try {
      await updateProductStatus(productId, newStatus);
      // Reload product details
      const reportIndex = reports.findIndex(r => r.product?.id === productId);
      if (reportIndex !== -1 && reports[reportIndex].product) {
        const updatedProduct = await getProductById(productId);
        setReports(prev => {
          const updated = [...prev];
          updated[reportIndex] = { ...updated[reportIndex], product: updatedProduct };
          return updated;
        });
      }
      alert('Product status updated successfully!');
    } catch (error: any) {
      alert(error?.message || 'Failed to update product status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <div className="space-y-4">
        {reports.map((report) => {
          const isExpanded = expandedReports.has(report.id);
          return (
            <div key={report.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-sm font-medium text-gray-900">Product ID:</span>
                    <span className="text-sm text-gray-600 font-mono">{report.productId}</span>
                    <button
                      onClick={() => loadProductDetails(report.id, report.productId)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          View Product
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-900">Reason:</span>
                    <span className="text-sm text-gray-600 ml-2">{report.reason}</span>
                  </div>
                  {report.description && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-900">Description:</span>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Reported by: {report.reportedBy}</span>
                    <span>•</span>
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>
                {report.status === 'pending' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleResolve(report.id, 'delete')}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Product
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, 'dismiss')}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      title="Dismiss Report"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {report.loadingProduct ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : report.product ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.product.images && report.product.images.length > 0 && (
                          <div className="md:col-span-2">
                            <img
                              src={report.product.images[0]}
                              alt={report.product.title}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">Title</p>
                          <p className="text-base font-semibold text-gray-900">{report.product.title}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Category</p>
                          <p className="text-base text-gray-900">{report.product.category}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Condition</p>
                          <p className="text-base text-gray-900">{report.product.condition}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Price</p>
                          <p className="text-base text-gray-900">
                            {report.product.price ? `PKR ${report.product.price.toLocaleString()}` : 'Bidding Only'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-base text-gray-900">{report.product.city}, {report.product.state}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                report.product.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : report.product.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : report.product.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {report.product.status}
                            </span>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                          <p className="text-base text-gray-900 mt-1">{report.product.description}</p>
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-900 mb-3">Change Product Status</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleStatusChange(report.product!.id, 'pending')}
                              disabled={report.product.status === 'pending'}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                report.product.status === 'pending'
                                  ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              }`}
                            >
                              Set Pending
                            </button>
                            <button
                              onClick={() => handleStatusChange(report.product!.id, 'approved')}
                              disabled={report.product.status === 'approved'}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                report.product.status === 'approved'
                                  ? 'bg-green-200 text-green-800 cursor-not-allowed'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(report.product!.id, 'rejected')}
                              disabled={report.product.status === 'rejected'}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                report.product.status === 'rejected'
                                  ? 'bg-red-200 text-red-800 cursor-not-allowed'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleStatusChange(report.product!.id, 'sold')}
                              disabled={report.product.status === 'sold'}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                report.product.status === 'sold'
                                  ? 'bg-blue-200 text-blue-800 cursor-not-allowed'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              Mark as Sold
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Product not found or has been deleted
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {reports.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            No reports found
          </div>
        )}
      </div>
    </div>
  );
}



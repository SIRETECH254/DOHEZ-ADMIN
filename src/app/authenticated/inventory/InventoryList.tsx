import React, { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiList, FiAlertTriangle, FiChevronDown, FiChevronUp, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useGetProducts, useUpdateProductSKU } from '../../../tanstack/useProducts';
import { useGetProductVariants } from '../../../tanstack/useProductVariants';
import Pagination from '../../../components/ui/Pagination';
import type { IProduct, ISKU, IVariant } from '../../../types/api.types';
import { getInitials } from '../../../utils';

const InventoryList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedSku, setSelectedSku] = useState<ISKU | null>(null);
  const [skuForm, setSkuForm] = useState({
    price: 0,
    stock: 0,
    lowStockThreshold: 0,
    allowPreOrder: false,
    isActive: true
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const params = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch.trim() || undefined,
  }), [debouncedSearch, currentPage, itemsPerPage]);

  const { data, isLoading, isError, error } = useGetProducts(params);
  const { data: variantsData } = useGetProductVariants({ limit: 100 });
  const updateSkuMutation = useUpdateProductSKU();

  const products = data?.products || [];
  const pagination = data?.pagination ?? { currentPage: 1, totalPages: 1, totalProducts: 0 };
  const variants = (variantsData as any)?.variants || [];
  const errorMessage = (error as any)?.response?.data?.message ?? 'An error occurred';

  const toggleRow = (productId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const calculateTotalStock = (product: IProduct) => {
    return product.skus?.reduce((acc, sku) => acc + (sku.stock || 0), 0) || 0;
  };

  const formatAttributes = (sku: ISKU, product: IProduct) => {
    console.log('DEBUG SKU attributes:', sku.attributes, 'Product variants:', product.variants);
    if (!sku.attributes || sku.attributes.length === 0) return 'Standard';
    
    return sku.attributes.map(attr => {
      const vId = typeof attr.variantId === 'object' ? (attr.variantId as any)._id : attr.variantId;
      const oId = typeof attr.optionId === 'object' ? (attr.optionId as any)._id : attr.optionId;

      // Try to find variant object
      let variant: any = null;
      if (typeof attr.variantId === 'object' && (attr.variantId as any).name) {
        variant = attr.variantId;
      } else {
        variant = (product.variants as any[])?.find(v => (v._id || v) === vId);
        if (!variant || !variant.name) {
          variant = variants.find((v: IVariant) => v._id === vId);
        }
      }
      
      if (!variant) return 'Unknown';

      // Try to find option object
      let option: any = null;
      if (typeof attr.optionId === 'object' && ((attr.optionId as any).value || (attr.optionId as any).name)) {
        option = attr.optionId;
      } else {
        option = variant.options?.find((o: any) => (o._id || o) === oId);
      }

      return `${variant.name}: ${option?.value || option?.name || 'Unknown'}`;
    }).join(', ');
  };

  const handleManageSku = (product: IProduct, sku: ISKU) => {
    setSelectedProduct(product);
    setSelectedSku(sku);
    setSkuForm({
      price: sku.price || 0,
      stock: sku.stock || 0,
      lowStockThreshold: sku.lowStockThreshold || 0,
      allowPreOrder: sku.allowPreOrder || false,
      isActive: sku.isActive !== undefined ? sku.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleUpdateSku = async () => {
    if (!selectedProduct || !selectedSku) return;
    
    try {
      await updateSkuMutation.mutateAsync({
        productId: selectedProduct._id,
        skuId: selectedSku._id,
        skuData: skuForm
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Update SKU error:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and manage product stock levels</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="input-search"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Showing {pagination.totalProducts} products</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <FiList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="input-select pl-10"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell w-10"></th>
              <th className="table-header-cell">Product</th>
              <th className="table-header-cell">Units</th>
              <th className="table-header-cell w-10"></th>
            </tr>
          </thead>
          <tbody className="table-body">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="table-row animate-pulse">
                    <td className="table-cell"></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="table-cell"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="table-cell"></td>
                  </tr>
                ))}
              </>
            )}

            {isError && !isLoading && (
              <tr>
                <td colSpan={4} className="table-cell-center py-12">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FiAlertTriangle className="text-brand-accent" size={48} />
                    <p className="text-sm font-medium text-gray-700">{errorMessage}</p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <tr>
                <td colSpan={4} className="table-cell-center py-12">
                  <p className="text-gray-500">No products found.</p>
                </td>
              </tr>
            )}

            {!isLoading && !isError && products.map((product: IProduct) => (
              <React.Fragment key={product._id}>
                <tr 
                  className="table-row cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleRow(product._id)}
                >
                  <td className="table-cell">
                    {expandedRows[product._id] ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                  </td>
                  <td className="table-cell font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                          {getInitials({ firstName: product.name, lastName: '' })}
                        </div>
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-900 font-medium">
                    {calculateTotalStock(product)}
                  </td>
                  <td className="table-cell"></td>
                </tr>
                
                {/* Expanded content */}
                {expandedRows[product._id] && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={4} className="p-0 border-b border-gray-200">
                      <div className="px-12 py-4 animate-fadeIn">
                        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-sm border border-gray-100">
                          <thead>
                            <tr className="bg-gray-50/50">
                              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attribute</th>
                              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                              <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock</th>
                              <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {product.skus?.map((sku: ISKU) => (
                              <tr key={sku._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                  {formatAttributes(sku, product)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                                  ${sku.price?.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {sku.stock}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {sku.lowStockThreshold}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleManageSku(product, sku);
                                    }}
                                    className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 font-semibold text-xs transition-colors"
                                  >
                                    <FiEdit2 size={14} />
                                    Manage
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {(!product.skus || product.skus.length === 0) && (
                              <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400 italic">
                                  No SKUs found for this product.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalProducts}
            currentPageCount={products.length}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Manage SKU Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div 
            className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Manage SKU</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Product Info Section */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                  <p className="text-sm font-bold text-gray-900">{selectedProduct?.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Variant & Options</label>
                  <p className="text-sm font-medium text-gray-700">{selectedSku && formatAttributes(selectedSku, selectedProduct!)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Price ($)</label>
                  <input 
                    type="number" 
                    value={skuForm.price}
                    onChange={(e) => setSkuForm({...skuForm, price: Number(e.target.value)})}
                    className="input py-2.5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Stock</label>
                  <input 
                    type="number" 
                    value={skuForm.stock}
                    onChange={(e) => setSkuForm({...skuForm, stock: Number(e.target.value)})}
                    className="input py-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Low Stock Threshold</label>
                <input 
                  type="number" 
                  value={skuForm.lowStockThreshold}
                  onChange={(e) => setSkuForm({...skuForm, lowStockThreshold: Number(e.target.value)})}
                  className="input py-2.5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Stock Status</span>
                  <span className="text-[10px] text-gray-500">Current availability</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${skuForm.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {skuForm.stock > 0 ? 'Available' : 'Out of Stock'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">Allow Pre-Order</span>
                  <span className="text-[10px] text-gray-500">Enable buying when out of stock</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={skuForm.allowPreOrder}
                    onChange={(e) => setSkuForm({...skuForm, allowPreOrder: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 btn-secondary"
                disabled={updateSkuMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateSku}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                disabled={updateSkuMutation.isPending}
              >
                {updateSkuMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Update SKU
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;

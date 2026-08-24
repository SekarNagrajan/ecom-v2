// Created by Antigravity (2026-08-24 11:18)
import { CloseCircleFilled, EditFilled, EyeFilled, FileTextOutlined, PlusSquareFilled, SyncOutlined, LockFilled } from '@ant-design/icons';
import { ListView } from '@solverminds/shared-ui/data-view/list-view';
import { useConfirm } from '@solverminds/shared-ui/hooks';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, message, Space, Tag, theme, Typography } from 'antd';
import { buildActionsColumn } from '../../components/shared/build-actions-column';
import { ListActionButton, ListActionsRow } from '../../components/shared/list-action-button';
import { fetchSIList } from './api/si.api';
import type { SIListDTO } from './types/si.types';

const { Title } = Typography;

export function ShippingInstructionDashboardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { data: siList = [], isLoading } = useQuery({
    queryKey: ['siList'],
    queryFn: async () => {
      const res = await fetchSIList();
      return res.data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'success';
      case 'Draft': return 'processing';
      case 'Create SI': return 'cyan';
      case 'Accepted': return 'green';
      case 'Declined': return 'error';
      default: return 'default';
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size={10}>
          <FileTextOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            SHIPPING INSTRUCTIONS
          </Title>
        </Space>
      </div>

      <Card style={{ padding: 0 }} bodyStyle={{ padding: 0 }}>
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
          <ListView
            rowData={siList}
            loading={isLoading}
            defaultColDef={{ filter: true }}
            columnDefs={[
              buildActionsColumn<SIListDTO>({
                field: 'id',
                width: 150,
                cellRenderer: (params: any) => {
                  const data = params.data as SIListDTO;
                  return (
                    <ListActionsRow>
                      {/* Locked */}
                      {data.status === 'Accepted' && (
                        <ListActionButton
                          title="Locked"
                          icon={<LockFilled />}
                          danger
                          onClick={(e) => { e.stopPropagation(); }}
                        />
                      )}

                      {/* Create SI */}
                      {data.status === 'Create SI' && (
                        <ListActionButton
                          title="Create SI"
                          icon={<PlusSquareFilled />}
                          color={token.colorSuccess}
                          onClick={(e) => { e.stopPropagation(); navigate({ to: `/app/shipping-instruction/wizard/${data.id}` }); }}
                        />
                      )}

                      {/* Draft (Edit) */}
                      {data.status === 'Draft' && (
                        <ListActionButton
                          title="Edit Draft"
                          icon={<EditFilled />}
                          color={token.colorWarning}
                          onClick={(e) => { e.stopPropagation(); navigate({ to: `/app/shipping-instruction/wizard/${data.id}` }); }}
                        />
                      )}

                      {/* View */}
                      {['Submitted', 'Accepted', 'Declined'].includes(data.status) && (
                        <ListActionButton
                          title="View"
                          icon={<EyeFilled />}
                          color={token.colorPrimary}
                          onClick={(e) => { e.stopPropagation(); navigate({ to: `/app/shipping-instruction/${data.id}` }); }}
                        />
                      )}

                      {/* Edit (Submitted) */}
                      {data.status === 'Submitted' && (
                        <ListActionButton
                          title="Edit"
                          icon={<EditFilled />}
                          color={token.colorWarning}
                          onClick={(e) => { e.stopPropagation(); navigate({ to: `/app/shipping-instruction/wizard/${data.id}` }); }}
                        />
                      )}

                      {/* Resubmit */}
                      {(data.status === 'Declined' || data.blStatus === 'Cancelled') && (
                        <ListActionButton
                          title="Resubmit"
                          icon={<SyncOutlined />}
                          color={token.colorSuccess}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (data.status === 'Declined') {
                              confirm.warning({
                                title: 'Carrier Remarks',
                                content: 'Please review and correct the reported discrepancies before resubmitting.',
                                onOk: () => navigate({ to: `/app/shipping-instruction/wizard/${data.id}` })
                              });
                            } else {
                              navigate({ to: `/app/shipping-instruction/wizard/${data.id}` });
                            }
                          }}
                        />
                      )}

                      {/* Cancel */}
                      {data.status === 'Submitted' && (
                        <ListActionButton
                          title="Cancel"
                          icon={<CloseCircleFilled />}
                          danger
                          onClick={(e) => {
                            e.stopPropagation();
                            confirm.danger({
                              title: 'Cancel Shipping Instruction',
                              content: 'Are you sure you want to cancel this Shipping Instruction?',
                              okText: 'Yes',
                              cancelText: 'No',
                              onOk: () => {
                                message.success(`Shipping Instruction ${data.siNo || data.id} cancelled.`);
                              }
                            });
                          }}
                        />
                      )}
                    </ListActionsRow>
                  );
                }
              }),
              {
                field: 'status',
                headerName: 'Status',
                cellRenderer: (params: any) => (
                  <Tag color={getStatusColor(params.value)}>{params.value}</Tag>
                )
              },
              { field: 'bookingNo', headerName: 'Booking No' },
              { field: 'blNo', headerName: 'B/L No' },
              { field: 'siNo', headerName: 'SI No' },
              { field: 'agencyRefNo', headerName: 'Agency Ref No' },
              { field: 'origin', headerName: 'Origin' },
              { field: 'delivery', headerName: 'Delivery' },
              { field: 'createdDate', headerName: 'Created Date' },
              { field: 'submittedDate', headerName: 'Submitted Date' }
            ]}
          />
        </div>
      </Card>
    </Space>
  );
}

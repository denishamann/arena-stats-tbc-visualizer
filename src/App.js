import 'bootstrap/dist/css/bootstrap.css';
import Papa from 'papaparse';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Nav,
  Row as BootstrapRow,
  Stack,
} from 'react-bootstrap';
import { computeBadges } from './badgeLogic';
import { timestampsOk } from './constants';
import { Row } from './row';
import BootstrapTable from 'react-bootstrap-table-next';

export default function App() {
  // React state
  const [showModal, setShowModal] = useState(false);
  const [importString, setImportString] = useState('');
  const [only2sData, setOnly2sData] = useState([]);
  const [corruptedCount, setCorruptedCount] = useState(0);
  const [season, setSeason] = useState('all');

  // Inferred state
  let totalMatches = 0;
  let totalWins = 0;
  let statsForEachComposition = [];
  let badges = [];

  if (!timestampsOk())
    console.log('Error in arena season start/end timestamps!');

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Import logic - compute state based on imported string
  const importConfirmed = () => {
    const result = Papa.parse(importString).data.map(row => new Row(row));
    const dataWithoutSkirm = result.filter(row => !row.isTitleOrSkirmish());
    const cleanData = cleanCorruptedData(dataWithoutSkirm);
    setCorruptedCount(dataWithoutSkirm.length - cleanData.length);
    const only2sData = cleanNon2sData(cleanData);
    setOnly2sData(only2sData);
    handleCloseModal();
  };

  const cleanCorruptedData = data => {
    console.log(
      'Corrupted data',
      data.filter(row => !row.isRowClean())
    );
    return data.filter(row => row.isRowClean());
  };

  const cleanNon2sData = data => {
    return data.filter(row => row.teamPlayerName3 === '');
  };

  // Rendering logic - compute inferred state based on state (i.e. user inputs)
  const processState = () => {
    if (only2sData.length) {
      const seasonSpecificData = getSeasonSpecificData(only2sData);
      const possibleCompositions =
        getAllPossibleCompositions(seasonSpecificData);
      statsForEachComposition = getStatsForEachComposition(
        seasonSpecificData,
        possibleCompositions
      );

      totalMatches = statsForEachComposition.reduce(
        (prev, curr) => prev + curr.total,
        0
      );
      totalWins = statsForEachComposition.reduce(
        (prev, curr) => prev + curr.wins,
        0
      );

      badges = computeBadges(seasonSpecificData);
    }
  };

  const getSeasonSpecificData = data => {
    switch (season) {
      case 'all':
        return data;
      case '1':
        return data.filter(row => row.isSeasonOne());
      case '2':
        return data.filter(row => row.isSeasonTwo());
      case '3':
        return data.filter(row => row.isSeasonThree());
      case '4':
        return data.filter(row => row.isSeasonFour());
      default:
        return data;
    }
  };

  const getAllPossibleCompositions = data => {
    const compositions = new Set();
    data.forEach(row => {
      if (row.enemyPlayerClass1 && row.enemyPlayerClass2) {
        const arr = [row.enemyPlayerClass1, row.enemyPlayerClass2].sort(
          (a, b) => a.localeCompare(b)
        );
        compositions.add(`${arr[0]}+${arr[1]}`);
      }
    });
    return Array.from(compositions).sort((a, b) => a.localeCompare(b));
  };

  const getStatsForEachComposition = (data, possibleCompositions) => {
    const stats = possibleCompositions.map(comp => {
      return {
        comp,
        total: 0,
        wins: 0,
        aTotal: 0,
        aWins: 0,
        hTotal: 0,
        hWins: 0,
      };
    });

    data.forEach(row => {
      const index = stats.findIndex(
        s =>
          s.comp === `${row.enemyPlayerClass1}+${row.enemyPlayerClass2}` ||
          s.comp === `${row.enemyPlayerClass2}+${row.enemyPlayerClass1}`
      );
      if (index !== -1) {
        stats[index].total = stats[index].total + 1;
        if (row.enemyFaction === 'ALLIANCE') {
          stats[index].aTotal = stats[index].aTotal + 1;
        } else if (row.enemyFaction === 'HORDE') {
          stats[index].hTotal = stats[index].hTotal + 1;
        }
        if (row.won()) {
          stats[index].wins = stats[index].wins + 1;
          if (row.enemyFaction === 'ALLIANCE') {
            stats[index].aWins = stats[index].aWins + 1;
          } else if (row.enemyFaction === 'HORDE') {
            stats[index].hWins = stats[index].hWins + 1;
          }
        }
      } else {
        console.log('Error with row', row);
      }
    });

    return stats.sort((a, b) => b.total - a.total);
  };

  processState();

  const columns = [
    {
      dataField: 'composition',
      text: 'Enemy composition',
      sort: true,
      formatter: cell => cell,
      sortValue: cell => cell,
      headerStyle: (column, colIndex) => {
        return { width: '200px' };
      },
    },
    {
      dataField: 'total',
      text: 'Total matches',
      sort: true,
      formatter: cell => {
        const item = JSON.parse(cell);
        return (
          <div>
            {item.total} <span className="blue">({item.aTotal}</span> +{' '}
            <span className="red">{item.hTotal}</span>)
          </div>
        );
      },
      sortValue: cell => JSON.parse(cell).total,
      headerStyle: (column, colIndex) => {
        return { width: '175px' };
      },
    },
    {
      dataField: 'wins',
      text: 'Wins',
      sort: true,
      formatter: cell => {
        const item = JSON.parse(cell);
        return (
          <div>
            {item.wins} <span className="blue">({item.aWins}</span> +{' '}
            <span className="red">{item.hWins}</span>)
          </div>
        );
      },
      sortValue: cell => JSON.parse(cell).wins,
      headerStyle: (column, colIndex) => {
        return { width: '175px' };
      },
    },
    {
      dataField: 'losses',
      text: 'Losses',
      sort: true,
      formatter: cell => {
        const item = JSON.parse(cell);
        return (
          <div>
            {item.total - item.wins}{' '}
            <span className="blue">({item.aTotal - item.aWins}</span> +{' '}
            <span className="red">{item.hTotal - item.hWins}</span>)
          </div>
        );
      },
      sortValue: cell => {
        const item = JSON.parse(cell);
        return item.total - item.wins;
      },
      headerStyle: (column, colIndex) => {
        return { width: '175px' };
      },
    },
    {
      dataField: 'percent',
      text: '%',
      sort: true,
      formatter: cell => {
        const item = JSON.parse(cell);
        return <div>{((item.wins / item.total) * 100).toFixed(1)}</div>;
      },
      sortValue: cell => {
        const item = JSON.parse(cell);
        return item.wins / item.total;
      },
      headerStyle: (column, colIndex) => {
        return { width: '90px' };
      },
    },
    {
      dataField: 'aPercent',
      text: '% (A)',
      sort: true,
      formatter: cell => {
        const item = JSON.parse(cell);
        return (
          <div className="blue">
            {item.aTotal !== 0
              ? ((item.aWins / item.aTotal) * 100).toFixed(1)
              : '-'}
          </div>
        );
      },
      sortValue: cell => {
        const item = JSON.parse(cell);
        return item.aTotal !== 0 ? item.aWins / item.aTotal : -1;
      },
      headerStyle: (column, colIndex) => {
        return { width: '90px' };
      },
    },
    {
      dataField: 'hPercent',
      text: '% (H)',
      sort: true,
      formatter: cell => {
        const item = JSON.parse(cell);
        return (
          <div className="red">
            {item.hTotal !== 0
              ? ((item.hWins / item.hTotal) * 100).toFixed(1)
              : '-'}
          </div>
        );
      },
      sortValue: cell => {
        const item = JSON.parse(cell);
        return item.hTotal !== 0 ? item.hWins / item.hTotal : -1;
      },
      headerStyle: (column, colIndex) => {
        return { width: '90px' };
      },
    },
  ];

  const content = statsForEachComposition.map(item => {
    return {
      composition: item.comp,
      total: JSON.stringify({
        total: item.total,
        aTotal: item.aTotal,
        hTotal: item.hTotal,
      }),
      wins: JSON.stringify({
        wins: item.wins,
        aWins: item.aWins,
        hWins: item.hWins,
      }),
      losses: JSON.stringify({
        total: item.total,
        wins: item.wins,
        aTotal: item.aTotal,
        aWins: item.aWins,
        hTotal: item.hTotal,
        hWins: item.hWins,
      }),
      percent: JSON.stringify({
        wins: item.wins,
        total: item.total,
      }),
      aPercent: JSON.stringify({
        aTotal: item.aTotal,
        aWins: item.aWins,
      }),
      hPercent: JSON.stringify({
        hTotal: item.hTotal,
        hWins: item.hWins,
      }),
    };
  });

  return (
    <>
      <div className="App">
        <Container>
          <Button className="modal-toggle" onClick={handleShowModal}>
            Import
          </Button>

          <Stack className="float-end">
            <div>
              Contribute to the tool{' '}
              <a href="https://github.com/denishamann/arena-stats-tbc-visualizer">
                here
              </a>
            </div>
            <div>
              Contribute to the addon{' '}
              <a href="https://github.com/denishamann/ArenaStatsTBC">here</a>
            </div>
            <div>
              Get the addon on Curseforge{' '}
              <a href="https://www.curseforge.com/wow/addons/arenastats-tbc">
                here
              </a>
            </div>
          </Stack>
        </Container>

        {!only2sData.length ? (
          <Container className="alerts-onboarding">
            <Alert key={'alert-infos'} variant={'primary'}>
              <Alert.Heading>Notice</Alert.Heading>
              This is a visualizer for the Classic TBC addon "ArenaStats - TBC"
              It allows you to import your data in order to analyze them by
              bracket, by season, by enemy composition, and much more (to come!)
              All you have to do is click on the "Export" button in-game, copy
              the String, click on the "Import" button here, and paste it.
            </Alert>
            <Alert key={'alert-data'} variant={'warning'}>
              It automatically removes all skirmishes and all non 2s matches.
              Support for 3s and 5s is coming soon™
            </Alert>
            <Alert key={'alert-trimming'} variant={'warning'}>
              You will only see stats for matches played since you installed the
              addon
            </Alert>
            <Alert key={'alert-leaving'} variant={'warning'}>
              If you want to leave a match in-game before it is ended, make sure
              you are the last one of your team alive. Otherwise, data for that
              particular match won't be recorded by the addon.
            </Alert>
          </Container>
        ) : (
          <Container>
            <br />
            <strong>Total matches: {totalMatches}</strong>
            <br />
            <strong className="total-wins">Total wins: {totalWins}</strong>
            <br />
            {!!totalMatches && (
              <strong>
                Total win rate: {((totalWins / totalMatches) * 100).toFixed(2)}%
              </strong>
            )}
            <br />
            <br />
            <Nav
              variant="pills"
              defaultActiveKey="all"
              onSelect={eventKey => {
                setSeason(eventKey);
              }}
            >
              <Nav.Item>
                <Nav.Link eventKey="all">All seasons</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="1">Season 1</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="2">Season 2</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="3">Season 3</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="4">Season 4</Nav.Link>
              </Nav.Item>
            </Nav>
            <br />{' '}
            <p>
              <span className="blue">Blue = vs Alliance</span>{' '}
              <span className="red">Red = vs Horde</span>
            </p>
            <BootstrapTable
              keyField="composition"
              data={content}
              columns={columns}
              bootstrap4={true}
              striped={true}
              bordered={true}
              hover={true}
              classes={'data-table'}
            />
            <Container>
              <BootstrapRow
                xs={1}
                sm={2}
                md={2}
                lg={3}
                xl={4}
                xxl={4}
                className="g-4"
              >
                {badges.map(badge => (
                  <Col key={badge.title}>
                    <Card
                      key={badge.title}
                      border={badge.appearance}
                      style={{ width: '18rem' }}
                    >
                      <Card.Header as="h5">{badge.title}</Card.Header>
                      <Card.Body>
                        <Card.Text className="mb-2 text-muted">
                          {badge.details}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </BootstrapRow>
            </Container>
            <br />
            <p>
              Skipped <strong className="red">{corruptedCount}</strong>{' '}
              unprocessable records (not only in 2s). Open console to inspect
              them if needed.
            </p>
          </Container>
        )}

        <Modal centered size="lg" show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Import</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Export string from addon</Form.Label>
                <Form.Control
                  autoFocus
                  as="textarea"
                  rows={20}
                  cols={50}
                  value={importString}
                  onChange={e => setImportString(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              className="import-confirmed"
              onClick={importConfirmed}
            >
              Import
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      <style jsx="true">{`
        .App {
          height: 100vh;
          // display: flex;
          // justify-content: center;
          align-items: center;
        }

        button.modal-toggle,
        .import-confirmed {
          background-color: darkgray;
          cursor: pointer;
          padding: 1rem 2rem;
          text-transform: uppercase;
          border: none;
          margin-top: 10px;
        }

        .total-wins {
          margin-bottom: 10px;
        }
        .data-table {
          margin-top: 10px;
        }
        .red {
          color: #dc3545;
        }
        .blue {
          color: #0dcaf0;
        }
        .alerts-onboarding {
          margin-top: 100px;
        }
      `}</style>
    </>
  );
}
